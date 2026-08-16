# JETRIDERS CLUB PAMPANGA INC. Website

Official GitHub Pages website for JETRIDERS CLUB PAMPANGA INC.

## Admin photo publishing

Open `admin.html` from the live website. The administrator can select up to 12 JPG, PNG, or WebP photos, preview captions, choose a gallery category, and publish the entire batch to the `main` branch in one commit.

The uploader requires a GitHub fine-grained personal access token restricted to this repository with **Contents: Read and write** permission. The token is never stored in the repository; it is kept only in the current browser session.

The public gallery reads `gallery.json` and lazy-loads photos by category.

## Other admin tools

The Admin Dashboard also supports:

- adding a member with an automatic next `JRCP-###` member ID
- editing an existing member's name, year joined, status, position, and photo
- adding or editing featured rides, including a cover photo
- adding or editing past presidents and uploading their photos
- uploading or replacing public legal documents and certificates in PDF format

Public content is loaded from `members.json`, `rides.json`, `past-presidents.json`, and `documents.json`. Updates are committed atomically to the `main` branch with the same repository-restricted Admin Key.
