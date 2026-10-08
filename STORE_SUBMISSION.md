# Samsung Seller Office submission notes

This document contains the reusable technical information for registering Vistivo TV. Do not include private certificate passwords or personal Seller Office information here.

## Application identity

- Application title: Vistivo TV
- Widget ID: `urn:vistivo:tv`
- Tizen application ID: `Ldpj5lV8v1.VistivoTV`
- Tizen package ID: `Ldpj5lV8v1`
- Profile: Samsung TV
- Minimum Tizen API version: 8.0
- Category: Lifestyle / Gallery
- Price: Free
- Website and support: https://github.com/Ex8k/VistivoTV
- Privacy policy: https://github.com/Ex8k/VistivoTV/blob/main/PRIVACY.md

Do not change the widget, application, or package IDs after the first Seller Office registration. Every uploaded package must use a unique version higher than the previous upload and the same author certificate.

## Short description

Browse your personal Immich photo and video library on a Samsung TV with a remote-first interface.

## Full description

Vistivo TV is an unofficial Samsung Tizen TV client for user-operated Immich servers. It provides a fast, remote-control-first photo timeline, year and month navigation, configurable gallery columns, fullscreen viewing, slideshow playback, video playback, settings, and multiple local profiles.

Vistivo TV connects directly to the Immich server selected by the user. It does not operate a developer cloud service and does not include advertising, analytics, or tracking. HTTPS is recommended. Immich is a third-party project, and Vistivo TV is not affiliated with or endorsed by Immich or Samsung.

## Certification test account

- Server URL: `https://demo.immich.app`
- Email: `demo@immich.app`
- Password: `demo`

The public Immich demo is intentionally used as the certification test server. Recheck that the credentials work and that the account contains both photo and compatible video test content immediately before submission.

## Reviewer test path

1. Launch Vistivo TV.
2. Enter the certification server URL, email, and password above.
3. Select **Sign In** with the remote.
4. Move through the gallery with the directional keys.
5. Use the right-side year/month rail to jump through the timeline.
6. Open a photo, move to the previous and next assets, and start/stop the slideshow.
7. Open a video and test play, pause, seek, previous, next, and Back.
8. Open Settings and change the gallery columns and slideshow interval.
9. Open the Privacy Policy.
10. Sign out and confirm the action.

## Network and privilege explanation

Vistivo TV requests Internet and public network access because users connect to arbitrary user-operated Immich servers. These servers can use HTTPS on the public Internet or HTTP on a private local network. A fixed domain allowlist is therefore not possible. The app warns the user and requires confirmation before sending credentials over plain HTTP.

TV input-device access is used for Samsung remote-control keys and media playback controls.

## Application feature declarations

- Photo browsing: Yes
- Video playback: Yes
- User login: Yes
- Paid content or in-app purchase: No
- Advertising: No
- Analytics or tracking: No
- Developer-operated cloud service: No
- Captions/subtitles: No
- Mouse required: No
- External keyboard required: No

## Store assets still required

Create and upload the following separately in Seller Office:

- 1920 x 1080 RGBA logo, no larger than 300 KB
- 1920 x 1080 RGB/JPG background, no larger than 300 KB
- 512 x 423 PNG icon, no larger than 300 KB
- At least four 1920 x 1080 JPG screenshots, each no larger than 500 KB
- Samsung UI Description document using the current Seller Office template

The in-package icons and banner are runtime assets and do not replace the Seller Office assets.

## Final pre-submission checks

- Add the Seller Office contact email; do not commit a personal address unless it is intended to be public.
- Confirm the public Privacy Policy URL opens without signing in.
- Confirm the certification account works from outside the developer's local network.
- Confirm the final package was produced by `scripts/Build-Release.ps1` and passes `scripts/Test-ReleasePackage.ps1`.
- Confirm the WGT contains only the approved runtime files and the two signature files.
- Confirm the author certificate matches every previous Vistivo TV package.
- Run Samsung Pre-Test before requesting certification.
- Test cold launch, Back/Exit behavior, offline behavior, photo viewing, slideshow, video playback, profile removal, and sign-out on the target TV.
