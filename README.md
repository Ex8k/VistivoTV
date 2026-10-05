# ImmichTV

ImmichTV is an unofficial, remote-control-first Samsung Tizen TV client for [Immich](https://immich.app/). It is built as a Tizen Web application using HTML, CSS, and JavaScript.

The project is currently developed and tested with:

- Samsung Q60D television
- Tizen TV 8.0
- Immich v3.1.0
- Tizen Studio on Windows

ImmichTV is a third-party project and is not affiliated with or endorsed by Immich or Samsung.

## Features

- Standard Immich email and password authentication
- Persistent Immich sessions
- Multiple user profiles and profile switching
- TV remote and D-pad navigation
- Fast month-based photo timeline
- Configurable thumbnail grid with 4 to 8 columns
- Year and month navigation rail
- Fullscreen photo viewer
- Slideshow with a configurable interval
- Video playback with play, pause, seek, and previous/next controls
- Settings screen designed for a TV remote

## Important SDK requirement

> **Install the latest available Tizen Studio and update all installed SDK packages and Samsung TV extensions before building this project.**

Using an outdated Tizen Studio, Baseline SDK, TV Extension, or Samsung Certificate Extension can cause SDK installation, certificate creation, device connection, signing, and application installation failures. Do not mix an old Tizen Studio installation with newer TV SDK packages.

Samsung notes that certificate creation no longer works with Samsung Certificate Extension versions earlier than `2.0.73` after September 2025. Open Tizen Studio Package Manager and update both the Main SDK and Extension SDK components before continuing.

Official references:

- [Installing the Samsung TV SDK](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html)
- [Samsung TV application certificates](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html)

## 1. Install Tizen Studio and the TV SDK

1. Download and install the latest [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download).
2. Start **Tizen Studio Package Manager**.
3. In the **Main SDK** tab, install or update the Tizen 8.0 platform and the required SDK tools, including:
   - Baseline SDK
   - Web CLI
   - Web IDE
4. In the **Extension SDK** tab, install or update:
   - TV Extensions 8.0 or the latest compatible TV Extension
   - TV Extensions Tools
   - Samsung Certificate Extension
5. Restart Tizen Studio after the packages have been installed.

The **Samsung Certificate Extension is required**. Without it, Certificate Manager cannot create the Samsung TV author and distributor certificates needed to install the application on a physical TV.

If Package Manager does not start automatically, launch it from the Tizen Studio installation directory:

```text
<TIZEN_STUDIO>\package-manager\package-manager.exe
```

## 2. Configure Visual Studio Code

This repository contains a **Tizen Web application**, not a Tizen .NET application. The recommended Microsoft editor integration is therefore **Visual Studio Code**, not the full Visual Studio IDE.

1. Install the latest [Visual Studio Code](https://code.visualstudio.com/).
2. Open Extensions and search for **Tizen TV**.
3. Install the extension published by **Samsung TV SDK** (`samsungtvsdk`).
4. Make sure its required base **Tizen** extension is also installed. Current versions normally install this dependency automatically.
5. Open the ImmichTV project directory in Visual Studio Code.
6. Open the Tizen extension's **Packages** view and install/update the latest compatible TV extension if requested.

The available commands can be found in the Command Palette by entering `Tizen` or `Tizen TV`. Depending on the extension version, they include project build, signed package build, device connection, application installation, and launch commands.

See Samsung's current [Tizen TV extension for VS Code guide](https://developer.samsung.com/smarttv/develop/tools/additional-tools/vscode-extension-new.html).

> **Visual Studio note:** "Visual Studio Tools for Tizen" is primarily intended for Tizen .NET projects. It is not required to build this HTML/CSS/JavaScript application.

## 3. Enable Developer Mode on the TV

The TV and development computer must be connected to the same local network.

1. Open **Apps** on the Samsung TV.
2. Enter `12345` using the remote control or on-screen keypad.
3. Turn **Developer Mode** on.
4. Enter the local IP address of the development computer.
5. Confirm the settings and fully restart the TV.

On models with an instant-on feature, a cold restart or disconnecting and reconnecting power may be required.

Official instructions: [Connecting a TV and the SDK](https://developer.samsung.com/smarttv/develop/faq/application-testing.html).

## 4. Connect the TV to the SDK

### Using Tizen Studio

1. Open **Tools > Device Manager**.
2. Open **Remote Device Manager**.
3. Add a new device using the TV's IP address and port `26101`.
4. Enable the connection.
5. If available, right-click the connected device and select **Permit to install applications**.

### Using Visual Studio Code

1. Open the Tizen extension panel.
2. Under **Actions**, select **Connect Device**.
3. Create a custom connection using the TV's IP address and port `26101`.
4. Connect the device.

### Using the command line

```powershell
<TIZEN_STUDIO>\tools\sdb.exe connect <TV_IP>:26101
<TIZEN_STUDIO>\tools\sdb.exe devices
```

The TV can display a connection approval prompt the first time it is connected.

## 5. Install Certificate Manager and create a certificate profile

Every application installed on a Samsung TV must be signed. The project cannot be deployed to a physical television without a valid Samsung certificate profile.

1. Confirm that **Samsung Certificate Extension** is installed in Package Manager.
2. In Tizen Studio, open **Tools > Certificate Manager**. You can also use **Tizen TV: Run Certificate Manager** from Visual Studio Code.
3. Create a new certificate profile.
4. Select **Samsung** as the certificate type.
5. Select **TV** as the device type.
6. Create or import an author certificate.
7. Create a distributor certificate and include the DUID of the target TV when requested.
8. Make the new certificate profile active.
9. Back up the author certificate and its password securely.

Updates must be signed with the same author certificate as the installed application. Losing this certificate means future builds cannot update the existing installation and must be installed as a different application or after uninstalling the old one.

Do not commit certificate files, password files, `profiles.xml`, or signed packages to Git.

## 6. Get the source code

```powershell
git clone <REPOSITORY_URL>
cd ImmichTV
```

The project does not contain a default Immich address or email address. They are entered on the TV during the first login.

## 7. Build and package

### Tizen Studio

1. Select **File > Import > Tizen > Tizen Project**.
2. Select this repository as the project directory.
3. Build the project as a Tizen Web application.
4. Make sure the correct Samsung certificate profile is active.
5. Build a signed `.wgt` package.

### Visual Studio Code

Open the Command Palette and run the Tizen TV signed-package build command. The exact command label can vary slightly between extension versions.

### Command line

Run the following commands from the repository root. Replace the paths and certificate profile name with values from your installation.

```powershell
& '<TIZEN_STUDIO>\tools\ide\bin\tizen.bat' build-web -- .
& '<TIZEN_STUDIO>\tools\ide\bin\tizen.bat' package -t wgt -s '<CERTIFICATE_PROFILE>' -- '.buildResult'
```

If the CLI asks for the author and distributor certificate passwords, enter them in the terminal. Typed password characters are intentionally not displayed.

## 8. Install and launch on a TV

First list the connected devices:

```powershell
& '<TIZEN_STUDIO>\tools\sdb.exe' devices
```

Install the signed package:

```powershell
& '<TIZEN_STUDIO>\tools\ide\bin\tizen.bat' install `
  -n ImmichTV.wgt `
  -s '<TV_IP>:26101' `
  -- '.buildResult'
```

Launch the application using the application ID from `config.xml`:

```powershell
& '<TIZEN_STUDIO>\tools\ide\bin\tizen.bat' run `
  -p 'Ldpj5lV8v1.ImmichTV' `
  -s '<TV_IP>:26101'
```

Installing a newer build with the same application ID and author certificate updates the existing application. An update normally preserves the saved Immich profiles and sessions. Uninstalling the application deletes its local application data.

## 9. Configure ImmichTV

On first launch, enter:

- **Server:** Full Immich server origin, for example `https://photos.example.com` or `http://192.168.1.100:2283`
- **Email:** Immich account email
- **Password:** Immich account password

After authentication, the password is not stored by ImmichTV. The server address, profile details, settings, and Immich session token are stored in the application's Tizen local storage so the user does not need to sign in after every restart.

For better security, use HTTPS whenever possible. When plain HTTP is used, login credentials and session tokens are not protected against interception on the local network. ImmichTV displays a warning and requires an additional confirmation before signing in over HTTP.

Saved profiles can be removed from the TV in Settings. Removing a profile deletes its locally stored session and requests server-side logout when the server is reachable. Session tokens are not passwords, but they grant access to the corresponding Immich account and must be treated as private data.

Additional users can be added from the profile picker. When two or more profiles exist, the active profile can also be changed by selecting the user name in the gallery header.

## Remote controls

### Gallery

- Arrow keys: Move through photos or the date rail
- Enter: Open the selected asset
- Up from the first row: Focus the top bar
- Left/Right in the top bar: Select the profile switcher or settings
- Back: Return to the previous area; from the home screen, open exit confirmation

### Photo viewer

- Left/Right: Previous or next photo
- Enter: Start or stop the slideshow
- Back: Return to the gallery

### Video viewer

- Left/Right: Select an on-screen playback control
- Enter: Activate the selected playback control
- Up/Down: Previous or next asset
- Play/Pause, Play, Pause, Stop, Rewind, and Fast Forward: Control playback directly when supported by the remote
- Back: Return to the gallery

## Troubleshooting

### SDK or extension installation fails

- Update Tizen Studio itself first.
- Update the Baseline SDK and SDK tools in the Main SDK tab.
- Update the TV Extension, TV Extension Tools, and Samsung Certificate Extension together.
- Restart Tizen Studio and Visual Studio Code after updating.
- Avoid combining packages from incompatible SDK releases.

### Certificate Manager is missing

Install **Samsung Certificate Extension** from the Package Manager's **Extension SDK** tab, then restart the development tools.

### Application installation fails

- Confirm Developer Mode is enabled.
- Confirm the TV and computer are on the same network.
- Confirm the host computer IP configured on the TV is correct.
- Confirm the TV is connected on port `26101`.
- Use **Permit to install applications** in Device Manager when available.
- Recreate the distributor certificate with the correct TV DUID.
- Make sure the new build uses the same author certificate as the installed application.
- Increase the application version in `config.xml` when deploying an update.

### `You are not an authorized user` or device information errors

Update the TV firmware, Tizen Studio, Main SDK packages, and Samsung TV extensions. Samsung specifically identifies old firmware or SDK versions as a cause of authorization and device-information errors.

### The application works in a browser but not on the TV

The browser, simulator, emulator, and physical TV can use different web-engine versions and media codecs. Always perform final testing on the target television.

## Project structure

```text
ImmichTV/
├── config.xml              Tizen application manifest
├── index.html              Application screens and controls
├── icon.png                Application icon
├── css/style.css           TV interface styling
├── js/main.js              Authentication, profiles, API and navigation
└── images/                 Additional application images
```

Generated build directories, signed packages, certificates, and local secrets must remain excluded from Git.

## Useful official documentation

- [Samsung Smart TV development documentation](https://developer.samsung.com/smarttv/develop/)
- [Installing the Samsung TV SDK](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/installing-tv-sdk.html)
- [Creating Samsung TV certificates](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk/creating-certificates.html)
- [Tizen TV extension for Visual Studio Code](https://developer.samsung.com/smarttv/develop/tools/additional-tools/vscode-extension-new.html)
- [Connecting to a TV device](https://developer.samsung.com/smarttv/develop/tools/additional-tools/vscode/connecting-to-tv-device.html)
- [Samsung Tizen TV command-line interface](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/command-line-interface.html)

