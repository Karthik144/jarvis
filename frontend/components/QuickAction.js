'use client'
import React from 'react';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';


const CustomButton = styled(Paper)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0.5, 2), // vertical, horizontal padding
  backgroundColor: '#FCFCF9', 
  borderRadius: 15,
  boxShadow: theme.shadows[1],
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));


export default function QuickAction({ text }) {

    return (
      <CustomButton
        role="button"
        tabIndex={0}
      >
        <Typography variant="caption">{text}</Typography>
      </CustomButton>
    ); 
}