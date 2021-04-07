import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useForgotPasswordMutation } from '../generated/graphql';

const ForgotPassword: React.FC<{}> = ({}) => {
    const [complete, setComplete] = useState(false) // toggles state when complete
    const [, forgotPassword] = useForgotPasswordMutation()
    return (
        <Wrapper variant="small">
        <Formik initialValues={{ email: "" }} 
                onSubmit={async (values, { setErrors }) => {
                    await forgotPassword(values)
                    setComplete(true)
                }} 
        >
            {({ isSubmitting }) => complete ? <Box>E-mail sent to that email address if active.</Box> : (
                <Form>
                    <InputField name="email" placeholder="email" label="Email" type="email" />
                    <Button marginTop={4} marginRight={4} type='submit' isLoading={isSubmitting} colorScheme='teal' >
                        Forgot Password
                    </Button>            
                </Form>
            )}
        </Formik>
    </Wrapper>
    )
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);