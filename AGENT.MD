# Vistivo TV — постійний контекст для агентів

Останнє оновлення: 2026-10-10.

Цей файл є стартовим контекстом для нового чату. Перед будь-якою роботою агент має прочитати його, потім перевірити фактичний стан репозиторію через `git status`, `config.xml` і відповідні файли. Не вважати згенеровані артефакти або локальні незакомічені зміни безпечними для видалення.

## 1. Мета проєкту

Vistivo TV — неофіційний клієнт Immich для Samsung Smart TV. Це Tizen Web application на HTML, CSS і JavaScript, оптимізований під пульт і D-pad.

Репозиторій: https://github.com/Ex8k/VistivoTV

Основне завдання зараз: завершити реєстрацію та подати застосунок на сертифікацію через Samsung TV Seller Office.

## 2. Поточна ідентичність застосунку

- Назва: `Vistivo TV`
- Поточна версія: `1.3.18`
- Widget ID: `urn:vistivo:tv`
- Tizen application ID: `Ldpj5lV8v1.VistivoTV`
- Package ID: `Ldpj5lV8v1`
- Профіль: `tv-samsung`
- Мінімальна Tizen API version: `8.0`
- Орієнтація: landscape
- Розмір екрана: `screen.size.all`
- Категорія для Samsung Store: `Lifestyle` (Gallery)
- Ціна: Free
- Privacy Policy: https://github.com/Ex8k/VistivoTV/blob/main/PRIVACY.md

Не змінювати Widget ID, application ID або package ID після реєстрації в Seller Office. Оновлення повинні мати більшу версію та бути підписані тим самим author certificate.

## 3. Що вже реалізовано

- Авторизація на довільному Immich server через email/password.
- Збереження сесії без збереження пароля.
- Кілька локальних профілів і перемикання між ними.
- Галерея з навігацією по місяцях і роках.
- Налаштування 4–8 колонок.
- Перегляд фото на весь екран.
- Слайдшоу з інтервалом 3, 5, 10 або 15 секунд.
- Відтворення відео та кнопки Play/Pause/Stop/Rewind/Fast Forward.
- Повна навігація пультом Samsung.
- Вихід із fullscreen photo через Return/Back, клавішу Escape або клік миші.
- Діалоги підтвердження виходу, sign out і видалення профілю.
- Обробка offline/network recovery.
- Вбудований екран Privacy Policy.
- Версія в Settings автоматично читається з Tizen app info; fallback читає `version` з `config.xml`. Не дублювати номер версії вручну в HTML/JS.

Користувач перевірив актуальну збірку на фізичному телевізорі та підтвердив, що все працює.

## 4. Перевірене обладнання

- Samsung Q60D / QN65Q60D
- Tizen TV 8.0
- Роздільна здатність 1920×1080
- Immich v3.1.0 під час основної розробки
- Windows + Tizen Studio

Не стверджувати підтримку старіших модельних груп без окремого тестування.

## 5. Важливі файли

- `config.xml` — єдине джерело версії та Tizen identity.
- `index.html` — екрани й елементи керування.
- `css/style.css` — TV UI та focus states.
- `js/main.js` — API Immich, профілі, navigation, viewer, media controls і version sync.
- `scripts/Build-Release.ps1` — чиста release-збірка через allowlist.
- `scripts/Test-ReleasePackage.ps1` — перевірка складу WGT.
- `README.md` — інструкції розробки, підписання й запуску.
- `STORE_SUBMISSION.md` — metadata та чекліст Seller Office. Розділ “Store assets still required” застарів: assets уже створені.
- `PRIVACY.md` — публічна privacy policy.

## 6. Release package

Готовий підписаний пакет:

`E:\work\tiztv\immich\ImmichTV\.release\output\VistivoTV-1.3.18.wgt`

Розмір під час останньої перевірки: 333612 bytes.

Пакет створено чистою збіркою і містить лише runtime allowlist та два signature files. Профіль підписання, який використовувався: `bHomeSamsung`.

Команда нової чистої збірки:

```powershell
.\scripts\Build-Release.ps1 -SigningProfile 'bHomeSamsung'
```

Перевірка наявного пакета:

```powershell
.\scripts\Test-ReleasePackage.ps1 -PackagePath '.release\output\VistivoTV-1.3.18.wgt'
```

Перед наступною store-збіркою:

1. Збільшити `version` тільки в `config.xml`.
2. Запустити `Build-Release.ps1`.
3. Переконатися, що ім’я output WGT відповідає новій версії.
4. Використовувати той самий author certificate.

Не пакувати корінь репозиторію і не використовувати старий `.buildResult` для Store.

## 7. Samsung Store assets

Основна папка для подачі:

`E:\work\tiztv\immich\ImmichTV\submission`

Store images:

- `submission/store-assets/vistivo-logo-1920x1080.png` — RGBA PNG, 1920×1080, до 300 KB.
- `submission/store-assets/vistivo-background-1920x1080.jpg` — RGB JPG, 1920×1080, до 300 KB.
- `submission/store-assets/vistivo-icon-512x423.png` — RGB PNG, 512×423, до 300 KB.

Актуальні вихідні screenshots у `images/` перевірено візуально та технічно 2026-10-10:

- `images/s1.jpg` — Sign in.
- `images/s2.jpg` — Gallery timeline.
- `images/s3.jpg` — Photo viewer.
- `images/s4.jpg` — Settings; на скриншоті видно актуальну версію `1.3.18`.
- `images/s5.jpg` — Profile picker.
- `images/s6.jpg` — Video player з панеллю керування.

Усі шість файлів мають 1920×1080, 72 DPI та розмір менше 500 KB. Рекомендована четвірка для Store: `s2`, `s3`, `s5`, `s6`, оскільки вона найкраще демонструє основні функції — галерею, перегляд фото, профілі та відтворення відео. `s4` придатний як додатковий або запасний кадр налаштувань; `s1` придатний, але екран входу менш показовий.

Папка `submission/screenshots/` містить точні актуальні копії всіх шести оригіналів `s1–s6`. Старий `s4-settings-cropped.jpg` видалено: повний актуальний `s4.jpg` використовується і для Store assets, і в UI Description. Для Store рекомендовано вибрати `s2`, `s3`, `s5`, `s6`.

## 8. Application UI Description

Офіційний Samsung template був наданий окремим файлом:

`E:\work\tiztv\immich\app_description_template_eng_v142_edited3.pptx`

Фінальний заповнений документ для подачі:

`E:\work\tiztv\immich\ImmichTV\submission\Vistivo-TV-Application-UI-Description-Samsung-v1.6.pptx`

Використовувати тільки Samsung `v1.6`. Старі `v1.0`, `v1.1`, `v1.2`, `v1.3` та неофіційний `Vistivo-TV-Application-UI-Description-v1.0.pptx` — проміжні версії, не для подачі.

Документ має 19 слайдів, зберігає офіційний формат 4:3, masters/layouts і містить:

- Revision History
- UI Structure
- Use Cases
- Menus and Functions з реальними скриншотами
- Remote Control Keys
- Language Options
- Certification test account

Усі зелені інструкції та приклади Samsung видалені. Фінальний PPTX пройшов структурну перевірку і був повністю відрендерений для візуального QA.

## 9. Рекомендовані дані Seller Office

- Application Name: `Vistivo TV`
- App Type: `Tizen Web Application`
- Default Language: `English`
- Service Category: `Lifestyle`
- Age Rating: `All Ages / Everyone`
- Price: `Free`
- In-App Purchase: `No`
- Advertising: `No`
- Analytics/Tracking: `No`
- External account required: `Yes`
- External device required: `No`
- Geolocation/IP restriction: `No`
- Interface language: English only
- Website: https://github.com/Ex8k/VistivoTV
- Privacy Policy: https://github.com/Ex8k/VistivoTV/blob/main/PRIVACY.md

Short description:

`View your Immich photo and video library on a Samsung Smart TV.`

Recommended tags:

`Immich, photos, videos, gallery, slideshow, self-hosted, personal media`

Certification account:

- Server: `https://demo.immich.app`
- Email: `demo@immich.app`
- Password: `demo`

Це публічний demo account. Безпосередньо перед подачею обов’язково перевірити, що login працює і в акаунті є фото та сумісне відео.

## 10. Що ще треба зробити

1. Увійти або зареєструватися в Samsung TV Seller Office.
2. Створити application record: `Vistivo TV`, Tizen Web Application, English.
3. Заповнити title, description, tags, Lifestyle category, All Ages rating і Privacy Policy URL.
4. Додати реальний public customer-support email.
5. Заповнити seller legal information: ім’я/компанія, representative, телефон, поштова адреса та registration number, якщо акаунт Company/Business.
6. Обрати service country/region. Для першої подачі Public Seller рекомендовано починати зі США; не вибирати регіони без готових юридичних або мовних вимог.
7. Завантажити три Store assets і чотири рекомендовані screenshots.
8. Завантажити `.release/output/VistivoTV-1.3.18.wgt`.
9. Додати test account та reviewer test path з `STORE_SUBMISSION.md`.
10. Додати офіційний `Vistivo-TV-Application-UI-Description-Samsung-v1.6.pptx` у Verification Info.
11. Вибрати спочатку модельну групу, що включає QN65Q60D / Tizen 8.0.
12. Запустити Samsung Pre-Test і зберегти точний текст усіх помилок.
13. Після успішного Pre-Test зробити release request / Submit.

## 11. Фінальний ручний тест перед Submit

- Cold launch після повного перезапуску TV.
- Sign in через HTTPS demo server.
- Profile picker і Add profile.
- Навігація D-pad по gallery і timeline rail.
- Fullscreen photo: Left/Right, Enter slideshow, Return, Escape, mouse click.
- Video: Play/Pause/Stop/Rewind/Fast Forward, previous/next, Return.
- Settings: columns та slideshow interval.
- Privacy Policy і повернення фокусу.
- Switch profile, Sign out, Remove profile з confirmations.
- Offline dialog і Try again.
- Exit confirmation з gallery.
- Відображення version `1.3.18` у Settings.

## 12. Стан Git і правила безпеки

На момент створення цього файлу tracked-зміни є в:

- `css/style.css`
- `index.html`
- `js/main.js`

Також є untracked assets, screenshots, `submission/` і `.codex-build/`.

Ці файли належать користувачу. Не виконувати `git reset --hard`, `git checkout --`, масове видалення або очищення без прямого запиту. Перед комітом показати `git status` і не додавати `.release`, `.codex-build`, certificates, passwords або інші secrets.

Поточний branch: `main`.

Поточний remote: `origin https://github.com/Ex8k/VistivoTV.git`.

Останній відомий commit під час створення файлу: `5966e81 samsung pablish update`.

## 13. Як починати новий чат

Новий агент повинен:

1. Прочитати цей файл повністю.
2. Виконати `git status --short`.
3. Перевірити version у `config.xml`.
4. Не перебудовувати або перегенеровувати готові Store assets/PPTX без запиту.
5. Якщо користувач продовжує публікацію, спочатку з’ясувати поточний екран або результат Samsung Seller Office / Pre-Test.
6. Якщо користувач повідомляє новий defect, виправити код, збільшити версію, зробити чисту підписану збірку, перевірити WGT і повторно протестувати на TV.

## 14. Відомі обмеження

- Інтерфейс лише англійською.
- Потрібен власний або test Immich server/account.
- HTTPS рекомендовано; HTTP дозволяється лише після попередження.
- Captions/subtitles не заявляються.
- Підтримка старіших Tizen model groups не підтверджена.
- Vistivo TV не пов’язаний офіційно з Immich або Samsung.