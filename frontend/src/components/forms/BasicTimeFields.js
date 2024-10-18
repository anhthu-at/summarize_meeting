import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Controller } from 'react-hook-form';

export default function TimePickerField(props) {
  const { label, control, width, name } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TimePicker
            label={label}
            sx={{ width: width }}
            onChange={onChange}
            value={value}
            slotProps={{
              textField:{
                error: !!error, 
                helperText: error?.message,
              }

          }} 
          />
          
        )}
      />
    </LocalizationProvider>
  );
}
