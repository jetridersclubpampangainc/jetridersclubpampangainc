// JETRIDERS Membership Applications -> Google Sheets backup bridge
// Deploy this file as a Google Apps Script Web App from the Google Sheet
// "Untitled form (Responses)" / Membership Applications Backup.
//
// Web App settings:
//   Execute as: Me
//   Who has access: Anyone
//
// After deployment, copy the Web App URL and place it in the website
// membership form as GOOGLE_BACKUP_URL.

const SHEET_NAME = 'Membership Applications Backup';

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'JETRIDERS membership backup' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);

    const payload = JSON.parse((e.postData && e.postData.contents) || '{}');

    const row = [
      new Date(),
      payload.reference_no || '',
      payload.application_type || '',
      payload.existing_member_id || '',
      payload.full_name || '',
      payload.nickname || '',
      payload.birth_date || '',
      payload.blood_type || '',
      payload.mobile_number || '',
      payload.email || '',
      payload.facebook_profile || '',
      payload.address || '',
      payload.emergency_contact_name || '',
      payload.emergency_contact_relation || '',
      payload.emergency_contact_mobile || '',
      payload.motorcycle_brand_model || '',
      payload.engine_cc || '',
      payload.has_valid_license ? 'YES' : 'NO',
      payload.motorcycle_registered ? 'YES' : 'NO',
      payload.complete_side_mirrors ? 'YES' : 'NO',
      payload.complete_riding_gear ? 'YES' : 'NO',
      payload.membership_category || '',
      payload.preferred_ride_group || '',
      payload.status || 'pending'
    ];

    sheet.appendRow(row);
    lock.releaseLock();

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
