import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

// our InputField component to take any props that a regular input field will take.
type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string
    label: string
};

const InputField: React.FC<InputFieldProps> = ({label, size: _, ...props}) => {
        //formik hook: pass in attributes, and a name
        const [field, {error}] = useField(props) 

        return (     
            // adding "!!" before error, which is a string, will convert it to the required type for isInvalid; which is a boolean.         
            <FormControl isInvalid={!!error}> 
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <Input {...field} {...props} id={field.name} placeholder={props.placeholder} />
                {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
            </FormControl>
          )
};

export default InputField;