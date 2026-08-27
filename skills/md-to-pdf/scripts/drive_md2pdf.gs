/**
 * drive_md2pdf.gs - convert every Markdown file in a Google Drive folder to PDF,
 * writing the results into a destination folder.
 *
 * The conversion happens entirely inside Google: Drive converts each .md into a
 * temporary Google Doc, exports that Doc as PDF, and the temp Doc is trashed.
 * Nothing is downloaded or re-uploaded, so there is no file-size ceiling.
 *
 * SETUP - two steps, no API services to enable.
 *   1. Go to https://script.google.com and start a new project.
 *   2. Paste this file over the default Code.gs, press Run, and authorise it.
 *      (It asks for Drive access because it reads and writes your own Drive,
 *      and for external requests because Drive's Markdown import is a REST call.)
 *
 * Idempotent and resumable: PDFs that already exist are skipped, so if the run
 * stops at Apps Script's six-minute limit, just press Run again.
 *
 * Run dryRun() first if you want to see what it would convert.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

var SOURCE_FOLDER_ID = '1Ww5q7HTHAjoRrV8DO2v_KhtegwI_fwCC';
var DEST_FOLDER_ID   = '1orckg9XS_PNfLV_34Smk0_tTGgg7oQni';

/** Set true to regenerate PDFs that already exist in the destination folder. */
var OVERWRITE_EXISTING = false;

/** Stop this many milliseconds in, to stay inside the 6-minute quota. */
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
                (remaining ? ', ' + remaining + ' left (press Run again)' : '');
  Logger.log(summary);
  return summary;
}

/** Convert one Markdown file, replacing any existing PDF of the same name. */
function convertOne_(file, dest, baseName, pdfName, replaceExisting) {
  var docId = markdownToGoogleDoc_(file, '__md2pdf_tmp_' + baseName);
  try {
    var pdf = DriveApp.getFileById(docId).getAs(MimeType.PDF).setName(pdfName);

    if (replaceExisting) {
      var stale = dest.getFilesByName(pdfName);
      while (stale.hasNext()) {
        stale.next().setTrashed(true);
      }
    }
    dest.createFile(pdf);
  } finally {
    DriveApp.getFileById(docId).setTrashed(true);
  }
}

/**
 * Upload the Markdown with a Google Docs target type so Drive converts it.
 * Uses the REST endpoint directly, which avoids requiring the advanced Drive
 * service to be switched on for the project.
 */
function markdownToGoogleDoc_(file, tempName) {
  var boundary = 'md2pdf' + Utilities.getUuid();
  var metadata = { name: tempName, mimeType: MimeType.GOOGLE_DOCS };

  var head = Utilities.newBlob(
    '--' + boundary + '\r\n' +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) + '\r\n' +
    '--' + boundary + '\r\n' +
    'Content-Type: text/markdown\r\n\r\n'
  ).getBytes();
  var tail = Utilities.newBlob('\r\n--' + boundary + '--\r\n').getBytes();
  var payload = head.concat(file.getBlob().getBytes()).concat(tail);

  var response = UrlFetchApp.fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true',
    {
      method: 'post',
      contentType: 'multipart/related; boundary=' + boundary,
      payload: payload,
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    }
  );

  if (response.getResponseCode() >= 300) {
    throw new Error('Markdown import failed (HTTP ' + response.getResponseCode() +
                    '): ' + response.getContentText());
  }
  return JSON.parse(response.getContentText()).id;
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
