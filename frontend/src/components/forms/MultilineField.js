import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { Controller } from 'react-hook-form'

export default function MultilineTextFields(props){
    const {label, placeholder, name, width, control} = props
    return (
        <Controller
            name={name}
            control={control}
            render={({
                field: {onChange, value},
                fieldState: {error},
                formState,

            }) => (
                <TextField
                    id="standard-multiline-flexible"
                    label={label}
                    multiline
                    onChange={onChange}
                    value={value}
                    sx={{width:{width}}} 
                    maxRows={1}
                    defaultValue="Default Value"
                    variant="standard"
                    placeholder = {placeholder} 
                    error = {!!error}
                    helperText = {error?.message}
                />
            )}
            />
        
    );
}

