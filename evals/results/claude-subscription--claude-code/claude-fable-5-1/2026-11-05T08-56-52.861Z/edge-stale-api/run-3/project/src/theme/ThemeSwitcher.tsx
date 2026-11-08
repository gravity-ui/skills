import {Display, Moon, Sun} from '@gravity-ui/icons';
import {Flex, Icon, SegmentedRadioGroup, useThemeType} from '@gravity-ui/uikit';
import type {IconData, SegmentedRadioGroupProps} from '@gravity-ui/uikit';

import type {AppTheme} from './AppThemeProvider';
import {useThemeSwitch} from './AppThemeProvider';

interface ThemeOption {
    value: AppTheme;
    label: string;
    icon: IconData;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
    {value: 'light', label: 'Светлая', icon: Sun},
    {value: 'dark', label: 'Тёмная', icon: Moon},
    {value: 'system', label: 'Системная', icon: Display},
];

export interface ThemeSwitcherProps
    extends Pick<SegmentedRadioGroupProps<AppTheme>, 'size' | 'width' | 'className' | 'style' | 'qa'> {
    /** Скрыть подписи и оставить только иконки (например, для тулбара). */
    iconsOnly?: boolean;
}

/**
 * Переключатель темы: светлая / тёмная / системная.
 * Значение берётся из AppThemeProvider, разрешённая тема — из uikit (`useThemeType`).
 */
export function ThemeSwitcher({iconsOnly = false, size = 'm', ...rest}: ThemeSwitcherProps) {
    const {theme, setTheme} = useThemeSwitch();
    // Во что фактически разрешилась тема (`system` -> `light` | `dark`), по данным ThemeProvider uikit.
    const resolvedType = useThemeType();

    return (
        <SegmentedRadioGroup<AppTheme>
            {...rest}
            name="app-theme"
            size={size}
            value={theme}
            onUpdate={setTheme}
            aria-label="Тема интерфейса"
        >
            {THEME_OPTIONS.map((option) => {
                const title =
                    option.value === 'system'
                        ? `${option.label} (сейчас: ${resolvedType === 'dark' ? 'тёмная' : 'светлая'})`
                        : option.label;

                return (
                    <SegmentedRadioGroup.Option key={option.value} value={option.value} title={title}>
                        <Flex as="span" inline alignItems="center" gap="spacing-1">
                            <Icon data={option.icon} size={16} />
                            {iconsOnly ? null : option.label}
                        </Flex>
                    </SegmentedRadioGroup.Option>
                );
            })}
        </SegmentedRadioGroup>
    );
}
