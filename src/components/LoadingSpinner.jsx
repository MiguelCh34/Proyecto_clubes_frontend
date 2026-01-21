import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingSpinner({ message = "Cargando..." }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        gap: 2
      }}
    >
      <CircularProgress 
        size={60}
        thickness={4}
        sx={{ 
          color: '#3b82f6',
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': {
              opacity: 1,
            },
            '50%': {
              opacity: 0.5,
            },
          },
        }} 
      />
      <Typography 
        sx={{ 
          color: '#94a3b8',
          fontSize: '16px',
          fontWeight: 500
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}