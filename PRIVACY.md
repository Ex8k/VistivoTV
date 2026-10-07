# Vistivo TV Privacy Policy

Effective date: October 7, 2026

Vistivo TV is an unofficial Samsung Tizen TV client for user-operated Immich servers. Vistivo TV is not affiliated with or endorsed by Immich or Samsung.

## Data handled by the application

Vistivo TV may store the following information locally on the television:

- the address of each Immich server added by the user;
- the profile name and email address returned by that Immich server;
- an Immich session token used to keep the profile signed in;
- application preferences, including gallery columns and slideshow interval.

The Immich password is used only to sign in directly to the server selected by the user. Vistivo TV does not store the password after the sign-in request is completed.

## How data is used

The stored information is used only to connect the application to the selected Immich server, display the user's library, switch between locally saved profiles, and retain application preferences.

Vistivo TV does not include advertising, analytics, tracking, or developer-operated cloud services. The application communicates directly with the Immich server configured by the user. The operator of that server may process and log requests according to its own policies.

## Session tokens and video playback

An Immich session token grants access to the corresponding account and must be treated as sensitive information. The token is stored in the Tizen application storage. It is isolated from ordinary applications by the TV platform, but it is not guaranteed to remain confidential if the television operating system or the Immich server is compromised.

For authenticated video playback, Immich may require the session token in the media URL. That URL may be recorded in Immich, reverse-proxy, or network logs controlled by the server operator.

## Network security

HTTPS is strongly recommended. If the user connects to an Immich server over plain HTTP, login credentials, session tokens, photographs, and videos are not encrypted in transit and may be intercepted by someone with access to the network. Vistivo TV displays a warning before signing in over HTTP.

## Data retention and deletion

Saved data remains on the television until the user removes the corresponding profile, signs out, clears application data, or uninstalls Vistivo TV. Removing a profile deletes its locally stored session and requests server-side logout when the Immich server is reachable. Uninstalling the application removes its Tizen application storage.

Deleting a profile from Vistivo TV does not delete the Immich account, photographs, videos, or other server data.

## Data sharing

Vistivo TV does not sell or share personal information with the developer. Data is sent only to the Immich server selected by the user and to infrastructure configured by that server's operator.

## Changes to this policy

This policy may be updated when application behavior or legal requirements change. The effective date at the top of this document identifies the current revision.

## Support and privacy questions

Project support and privacy questions can be submitted through the Vistivo TV repository:

https://github.com/Ex8k/VistivoTV
