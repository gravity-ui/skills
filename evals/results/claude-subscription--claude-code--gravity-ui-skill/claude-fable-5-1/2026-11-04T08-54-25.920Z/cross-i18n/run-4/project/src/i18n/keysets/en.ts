export const en = {
  app: {
    title: 'Gravity UI i18n demo',
    subtitle: 'Switch the interface language and watch both app strings and built-in Gravity UI labels update.',
    language: 'Language',
    'current-language': 'Current language: {{lang}}',
    'card-title': 'Project overview',
    'card-text':
      'This card is translated through @gravity-ui/i18n keysets. The pagination, alert and copy button below take their labels from Gravity UI itself.',
    'items-count': {
      zero: 'No items',
      one: '{{count}} item',
      other: '{{count}} items',
    },
    today: 'Today is {{date}}',
    'alert-title': 'Language saved',
    'alert-message': 'Your choice is stored in the browser and restored on the next visit.',
    'copy-label': 'Copy link',
    save: 'Save',
    cancel: 'Cancel',
    'items-label': 'Items on this page',
  },
} as const;
