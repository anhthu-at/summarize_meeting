import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Controller } from 'react-hook-form';
import FormHelperText from '@mui/material/FormHelperText';


export default function BasicSelectFields(props) {

  const { label, name, width, control, options } = props
  const [age, setAge] = React.useState('');

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, value },
        fieldState: { error },
        formState,

      }) => (
        <FormControl variant="standard" sx={{ width: '50%' }}>
          <InputLabel id="demo-simple-select-standard-label">{label}</InputLabel>

          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={value}
            onChange={onChange}
            error={!!error}
          >
            {
              // option. các tên điền vào phải giống với models đã được khai báo ở backend
              options.map((options) => (
                <MenuItem value={options.num_depart}>{options.name_depart}</MenuItem>
              ))
            }


            
          </Select>

          <FormHelperText sx={{ colors: '#d32f2f' }}>  {error?.message} </FormHelperText>

        </FormControl>
      )}/>
  );
}