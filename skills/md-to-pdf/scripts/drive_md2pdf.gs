/**
 * drive_md2pdf.gs - convert every Markdown file in a Google Drive folder to PDF,
 * writing the results into a destination folder.
 *
 * The conversion happens entirely inside Google's infrastructure: Drive converts
 * each .md to a temporary Google Doc, exports that Doc as PDF, then the temp Doc
 * is trashed. Nothing is downloaded or re-uploaded, so file size is not a concern.
 *
 * SETUP
 *   1. Go to https://script.google.com and create a new project.
 *   2. Paste this file in, replacing the default Code.gs contents.
 *   3. In the left sidebar click Services (+), choose "Drive API", pick v3, Add.
 *   4. Set SOURCE_FOLDER_ID and DEST_FOLDER_ID below.
 *   5. Select convertFolder() from the function dropdown and press Run.
 *      Authorise the script when prompted (it only touches your own Drive).
 *
 * The script is idempotent and resumable: PDFs that already exist are skipped, so
 * if it stops at the six-minute execution limit just run it again.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

var SOURCE_FOLDER_ID = '1Ww5q7HTHAjoRrV8DO2v_KhtegwI_fwCC';
var DEST_FOLDER_ID   = '1orckg9XS_PNfLV_34Smk0_tTGgg7oQni';

/** Set true to regenerate PDFs that already exist in the destination folder. */
var OVERWRITE_EXISTING = false;

/** Stop this many milliseconds in, to stay under the 6-minute quota. */
var TIME_BUDGET_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------

function convertFolder() {
  var started = new Date().getTime();

  var source = DriveApp.getFolderById(SOURCE_FOLDER_ID);
  var dest = DriveApp.getFolderById(DEST_FOLDER_ID);

  var existing = {};
  var destFiles = dest.getFiles();
  while (destFiles.hasNext()) {
    existing[destFiles.next().getName()] = true;
  }

  var converted = 0, skipped = 0, failed = 0, remaining = 0;
  var files = source.getFiles();

  while (files.hasNext()) {
    var file = files.next();
    var name = file.getName();

    if (!/\.(md|markdown)$/i.test(name)) {
      continue;
    }

    var baseName = name.replace(/\.(md|markdown)$/i, '');
    var pdfName = baseName + '.pdf';

    if (existing[pdfName] && !OVERWRITE_EXISTING) {
      Logger.log('skip (exists): ' + pdfName);
      skipped++;
      continue;
    }

    if (new Date().getTime() - started > TIME_BUDGET_MS) {
      remaining++;
      continue;
    }

    try {
      convertOne_(file, dest, baseName, pdfName, existing[pdfName]);
      Logger.log('converted: ' + name + ' -> ' + pdfName);
      converted++;
    } catch (err) {
      Logger.log('FAILED: ' + name + ' - ' + err);
      failed++;
    }
  }

  var summary = 'converted ' + converted + ', skipped ' + skipped +
                ', failed ' + failed +
                (remaining ? ', ' + remaining + ' left (run again)' : '');
  Logger.log(summary);
  return summary;
}

/** Convert a single Markdown file, replacing any existing PDF of the same name. */
function convertOne_(file, dest, baseName, pdfName, replaceExisting) {
  // Drive converts Markdown to a Google Doc on upload; copying with a Google Docs
  // target mime type is the fallback if this deployment does not allow that.
  var tempName = '__md2pdf_tmp_' + baseName;
  var tempDoc;
  try {
    tempDoc = Drive.Files.create(
      { name: tempName, mimeType: MimeType.GOOGLE_DOCS },
      file.getBlob().setContentType('text/markdown')
    );
  } catch (uploadErr) {
    tempDoc = Drive.Files.copy(
      { name: tempName, mimeType: MimeType.GOOGLE_DOCS },
      file.getId(),
      { supportsAllDrives: true }
    );
  }

  try {
    var pdf = DriveApp.getFileById(tempDoc.id).getAs(MimeType.PDF).setName(pdfName);

    if (replaceExisting) {
      var stale = dest.getFilesByName(pdfName);
      while (stale.hasNext()) {
        stale.next().setTrashed(true);
      }
    }
    dest.createFile(pdf);
  } finally {
    DriveApp.getFileById(tempDoc.id).setTrashed(true);
  }
}

/** Report what convertFolder() would do, without writing anything. */
function dryRun() {
  var source = DriveApp.getFolderById(SOURCE_FOLDER_ID);
  var files = source.getFiles();
  var found = [];
  while (files.hasNext()) {
    var name = files.next().getName();
    if (/\.(md|markdown)$/i.test(name)) {
      found.push(name);
    }
  }
  Logger.log(found.length + ' Markdown file(s):\n' + found.join('\n'));
  return found;
}
