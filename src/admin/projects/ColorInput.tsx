import { useInput } from 'react-admin';
import { Box, TextField } from '@mui/material';

const ColorInput = ({ source, label = 'Color', validate, ...rest }: {
    source: string;
    label?: string;
    validate?: any;
    [key: string]: any;
}) => {
    const { field, fieldState: { error, isTouched } } = useInput({ source, validate, ...rest });

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
            <input
                type="color"
                value={field.value || '#000000'}
                onChange={(e) => field.onChange(e.target.value)}
                style={{ width: 40, height: 40, border: 'none', cursor: 'pointer' }}
            />
            <TextField
                label={label}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={!!(isTouched && error)}
                helperText={isTouched && error ? error.message : ''}
                size="small"
                variant="outlined"
            />
        </Box>
    );
};

export default ColorInput;
