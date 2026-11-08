import {Flex, Icon, SegmentedRadioGroup} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

export interface ThemeSwitchProps {
    value: ThemeType;
    onChange: (theme: ThemeType) => void;
}

export function ThemeSwitch({value, onChange}: ThemeSwitchProps) {
    return (
        <SegmentedRadioGroup<ThemeType>
            aria-label="Тема оформления"
            size="m"
            value={value}
            onUpdate={onChange}
            options={[
                {
                    value: 'light',
                    title: 'Светлая тема',
                    content: (
                        <Flex alignItems="center" gap={1}>
                            <Icon data={Sun} size={16} />
                            Светлая
                        </Flex>
                    ),
                },
                {
                    value: 'dark',
                    title: 'Тёмная тема',
                    content: (
                        <Flex alignItems="center" gap={1}>
                            <Icon data={Moon} size={16} />
                            Тёмная
                        </Flex>
                    ),
                },
            ]}
        />
    );
}
