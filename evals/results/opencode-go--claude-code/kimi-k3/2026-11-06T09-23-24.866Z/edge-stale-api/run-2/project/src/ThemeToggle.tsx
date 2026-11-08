import {Icon, SegmentedRadioGroup} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import type {AppTheme} from './useAppTheme';

const optionContentStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
};

export interface ThemeToggleProps {
    theme: AppTheme;
    onChange: (theme: AppTheme) => void;
}

export function ThemeToggle({theme, onChange}: ThemeToggleProps) {
    return (
        <SegmentedRadioGroup<AppTheme>
            aria-label="Тема оформления"
            value={theme}
            onUpdate={onChange}
            options={[
                {
                    value: 'light',
                    content: (
                        <span style={optionContentStyle}>
                            <Icon data={Sun} size={16} />
                            Светлая
                        </span>
                    ),
                },
                {
                    value: 'dark',
                    content: (
                        <span style={optionContentStyle}>
                            <Icon data={Moon} size={16} />
                            Тёмная
                        </span>
                    ),
                },
            ]}
        />
    );
}
