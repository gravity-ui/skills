import {Box, Flex, Text} from '@gravity-ui/uikit';

interface PlaceholderPageProps {
    title: string;
    description: string;
}

export function PlaceholderPage({title, description}: PlaceholderPageProps) {
    return (
        <Box spacing={{p: 6}}>
            <Flex direction="column" gap={2}>
                <Text variant="header-1">{title}</Text>
                <Text variant="body-2" color="secondary">
                    {description}
                </Text>
            </Flex>
        </Box>
    );
}
