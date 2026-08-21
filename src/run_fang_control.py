"""The control on the Fang et al. benchmark. Per paper/FANG_CHECK_PREREG.md.

Streams the 13.4GB tarball and processes one datapack at a time, so peak
disk stays near zero. Nothing is stored: this box has less free disk than
the archive is large.

PRIMARY   score(s) = p90(duration | abnormal) / p90(duration | normal)
SECONDARY score(s) = mean(...) / mean(...)
Worst-rank tie-breaking, identical to the RE2 control.
"""
import io, json, re, sys, tarfile, time, urllib.request
import numpy as np, pandas as pd

URL = ("https://zenodo.org/api/records/17105974/files/"
       "rcabench-absolute_anomaly.tar.gz/content")
OUT = "results/fang_control.csv"
NEED = {"injection.json", "normal_traces.parquet", "abnormal_traces.parquet",
        "env.json", ".finished"}


def rc_from_injection(blob):
    """Root cause SERVICE from injection.json.

    Authoritative source, in order:
      1. ground_truth["service"][0]
      2. display_config (a stringified JSON) -> injection_point.app_name
    Returns (service, source) or (None, None).
    """
    try:
        d = json.loads(blob.decode("utf-8", "replace"))
    except Exception:
        return None, None
    gt = d.get("ground_truth")
    if isinstance(gt, str):
        try:
            gt = json.loads(gt)
        except Exception:
            gt = None
    if isinstance(gt, dict):
        svc = gt.get("service")
        if isinstance(svc, list) and svc and isinstance(svc[0], str):
            return svc[0].strip(), "ground_truth.service"
        if isinstance(svc, str) and svc.strip():
            return svc.strip(), "ground_truth.service"
    dc = d.get("display_config")
    if isinstance(dc, str):
        try:
            dc = json.loads(dc)
        except Exception:
            dc = None
    if isinstance(dc, dict):
        ip = dc.get("injection_point")
        if isinstance(ip, dict) and isinstance(ip.get("app_name"), str):
            return ip["app_name"].strip(), "display_config.injection_point.app_name"
    return None, None


def rc_from_name(name):
    """{system}-{service}-{faulttype}-{hash}; service is the ts-* run."""
    m = re.match(r"^[a-z0-9]+-(ts-[a-z0-9-]+?)-([a-z0-9_]+)-([a-z0-9]{6})$", name)
    return m.group(1) if m else None


def worst_rank(scores, target):
    s = {k: v for k, v in scores.items() if v == v and np.isfinite(v)}
    if target not in s:
        return None
    tv = s[target]
    return (sum(1 for v in s.values() if v > tv)
            + sum(1 for v in s.values() if v == tv))


def per_service(buf, stat):
    df = pd.read_parquet(io.BytesIO(buf), columns=["service_name", "duration"])
    df = df.dropna(subset=["service_name", "duration"])
    if not len(df):
        return {}
    g = df.groupby("service_name")["duration"]
    return (g.quantile(0.9) if stat == "p90" else g.mean()).to_dict()


def score_pack(name, files):
    rec = {"datapack": name}
    rc_inj, src = rc_from_injection(files.get("injection.json", b""))
    rc_name = rc_from_name(name)
    rc = rc_inj or rc_name                    # injection.json wins, per prereg
    rec["rc_service"] = rc
    rec["rc_source"] = src or ("dirname" if rc_name else None)
    rec["rc_from_name"] = rc_name
    rec["label_disagreement"] = bool(rc_inj and rc_name and rc_inj != rc_name)
    rec["finished"] = ".finished" in files
    if not rec["finished"]:
        rec["excluded"] = "no .finished marker"; return rec
    if "normal_traces.parquet" not in files or "abnormal_traces.parquet" not in files:
        rec["excluded"] = "missing trace file"; return rec
    if not rc:
        rec["excluded"] = "no root cause label"; return rec
    for stat in ("p90", "mean"):
        try:
            pre = per_service(files["normal_traces.parquet"], stat)
            post = per_service(files["abnormal_traces.parquet"], stat)
        except Exception as ex:
            rec[f"err_{stat}"] = repr(ex)[:120]; continue
        common = [s for s in post if s in pre and pre[s] and pre[s] > 0]
        if len(common) < 2:
            rec["excluded"] = "fewer than 2 traced services"; continue
        ratios = {s: post[s] / pre[s] for s in common}
        rec[f"{stat}_rank"] = worst_rank(ratios, rc)
        rec[f"{stat}_n_services"] = len(ratios)
        rec[f"{stat}_rc_in_traces"] = rc in ratios
    return rec


def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    req = urllib.request.Request(URL, headers={"User-Agent": "research-script"})
    rows, cur, files, n, t0 = [], None, {}, 0, time.time()
    with urllib.request.urlopen(req) as resp:
        with tarfile.open(fileobj=resp, mode="r|gz") as tar:
            for m in tar:
                if not m.isfile():
                    continue
                parts = m.name.split("/")
                if len(parts) < 2:
                    continue
                pack, base = parts[0], parts[-1]
                if pack != cur:
                    if cur is not None and files:
                        rows.append(score_pack(cur, files)); n += 1
                        if n % 25 == 0:
                            pd.DataFrame(rows).to_csv(OUT, index=False)
                            print(f"  {n} packs, {time.time()-t0:.0f}s", flush=True)
                        if limit and n >= limit:
                            break
                    cur, files = pack, {}
                if base in NEED:
                    try:
                        f = tar.extractfile(m)
                        if f is not None:
                            files[base] = f.read()
                    except Exception:
                        pass
            if cur is not None and files and (not limit or n < limit):
                rows.append(score_pack(cur, files))
    pd.DataFrame(rows).to_csv(OUT, index=False)
    print("WROTE", OUT, len(rows), f"{time.time()-t0:.0f}s")


if __name__ == "__main__":
    main()
