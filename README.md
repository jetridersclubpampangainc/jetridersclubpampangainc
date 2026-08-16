# JETRIDERS CLUB PAMPANGA INC. Website

Official GitHub Pages website for JETRIDERS CLUB PAMPANGA INC.

## Admin photo publishing

Open `admin.html` from the live website. The administrator can select up to 12 JPG, PNG, or WebP photos, preview captions, choose a gallery category, and publish the entire batch to the `main` branch in one commit.

The uploader requires a GitHub fine-grained personal access token restricted to this repository with **Contents: Read and write** permission. The token is never stored in the repository; it is kept only in the current browser session.

The public gallery reads `gallery.json` and lazy-loads photos by category.
