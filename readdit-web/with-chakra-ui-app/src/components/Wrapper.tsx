import React from 'react';
import {Box} from '@chakra-ui/react'
interface WrapperProps {
    variant?: 'small' | 'regular'
};

const Wrapper: React.FC<WrapperProps> = ({children, variant='regular'}) => {
        return <Box marginTop={8} marginX="auto" maxWidth={variant === "regular" ? "800px" : "400px"} width="100%">
            {children}
        </Box>
};

export default Wrapper;