import {I18N} from '@gravity-ui/i18n';
export const ru = {
 settings:'Настройки', profile:'Мой профиль', security:'Безопасность', notifications:'Уведомления', preferences:'Язык и регион',
 personal:'Личный аккаунт', workspace:'Ваше пространство', subtitle:'Всё, что делает пространство вашим. Управляйте личными данными и предпочтениями.',
 profileTitle:'Настройки профиля', account:'АККАУНТ', personalData:'Личные данные', personalHint:'Так вас будут видеть другие участники пространства.',
 avatar:'Фото профиля', upload:'Загрузить фото', remove:'Удалить', uploadHint:'JPG, PNG или WebP. Не больше 5 МБ.',
 name:'Имя', namePlaceholder:'Как к вам обращаться?', email:'Email', emailHint:'Для входа в аккаунт и важных писем.',
 preferencesHint:'Настройте интерфейс под себя.', language:'Язык интерфейса', languageHint:'Изменится после сохранения настроек.', timezone:'Часовой пояс', timezoneHint:'Используется для времени событий и уведомлений.', searchTimezone:'Найти часовой пояс',
 securityHint:'Дополнительная защита вашего аккаунта.', twoFactor:'Двухфакторная авторизация', twoFactorHint:'Добавьте второй этап проверки при входе в аккаунт.', recommended:'Рекомендуем',
 notificationsHint:'Выберите, какие письма вы хотите получать.', emailNotifications:'Email-уведомления', news:'Новости продукта', newsHint:'Новые возможности, улучшения и полезные советы.', alerts:'Системные алерты', alertsHint:'Важные изменения и события в вашем аккаунте.', digest:'Дайджест за неделю', digestHint:'Главное за неделю в одном письме.',
 save:'Сохранить', cancel:'Отмена', saved:'Все изменения сохранены', unsaved:'Есть несохранённые изменения', cancelled:'Изменения отменены', saveSuccess:'Настройки успешно сохранены',
 nameError:'Введите имя', emailError:'Введите корректный email', avatarError:'Выберите JPG, PNG или WebP размером до 5 МБ.', readError:'Не удалось прочитать изображение. Попробуйте другой файл.', storageError:'Не удалось сохранить настройки. Освободите место в браузере или выберите фото меньшего размера.',
 help:'Нужна помощь?', helpHint:'Мы рядом, если возникнут вопросы.', helpLink:'Центр помощи', helpTitle:'Помощь с настройками', helpText:'Измените нужные поля и нажмите «Сохранить». Кнопка «Отмена» вернёт последние сохранённые настройки. Для аватара подойдёт изображение JPG, PNG или WebP размером до 5 МБ.', close:'Понятно',
 privacy:'Ваши данные — под вашим контролем', privacyHint:'Личные настройки видны только вам.', footer:'Маленькие настройки. Большое удобство.', member:'Личное пространство',
 twoFactorDemo:'В этой версии сохраняется только настройка. Для защиты входа требуется подключение сервиса авторизации.',
};
const en: typeof ru = {
 settings:'Settings', profile:'My profile', security:'Security', notifications:'Notifications', preferences:'Language & region',
 personal:'Personal account', workspace:'Your workspace', subtitle:'Make this space your own. Manage your personal information and preferences.',
 profileTitle:'Profile settings', account:'ACCOUNT', personalData:'Personal information', personalHint:'This is how other people will see you in your workspace.',
 avatar:'Profile photo', upload:'Upload photo', remove:'Remove', uploadHint:'JPG, PNG or WebP. Up to 5 MB.',
 name:'Name', namePlaceholder:'What should we call you?', email:'Email', emailHint:'For signing in and important messages.',
 preferencesHint:'Make the interface feel like home.', language:'Interface language', languageHint:'Applied when you save your settings.', timezone:'Time zone', timezoneHint:'Used for event and notification times.', searchTimezone:'Find a time zone',
 securityHint:'An extra layer of account protection.', twoFactor:'Two-factor authentication', twoFactorHint:'Add a second verification step when signing in.', recommended:'Recommended',
 notificationsHint:'Choose the emails you would like to receive.', emailNotifications:'Email notifications', news:'Product news', newsHint:'New features, improvements and helpful tips.', alerts:'System alerts', alertsHint:'Important changes and events in your account.', digest:'Weekly digest', digestHint:'Your weekly highlights in one email.',
 save:'Save changes', cancel:'Cancel', saved:'All changes saved', unsaved:'You have unsaved changes', cancelled:'Changes discarded', saveSuccess:'Settings saved successfully',
 nameError:'Enter your name', emailError:'Enter a valid email', avatarError:'Choose a JPG, PNG or WebP image up to 5 MB.', readError:'Could not read this image. Try another file.', storageError:'Could not save your settings. Free up browser storage or choose a smaller photo.',
 help:'Need a hand?', helpHint:'We’re here if you have questions.', helpLink:'Help center', helpTitle:'Help with settings', helpText:'Update your details and select Save changes. Cancel restores your last saved settings. Your avatar can be a JPG, PNG or WebP image up to 5 MB.', close:'Got it',
 privacy:'Your data, under your control', privacyHint:'Only you can see your personal settings.', footer:'Small settings. A space that feels like you.', member:'Personal workspace',
 twoFactorDemo:'This version saves the preference only. Account protection requires connecting an authentication service.',
};
export const i18n = new I18N();
i18n.registerKeysets('ru',{profile:ru});
i18n.registerKeysets('en',{profile:en});
