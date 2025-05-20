import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import API_URL from '../config';

function Analysis() {
  const [startDate, setStartDate] = useState(startOfMonth(subMonths(new Date(), 1)));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [salesData, setSalesData] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);

  const products = [
    'all',
    'Kai Muruku',
    'Achu Muruku',
    'Kothu Muruku',
    'Adai',
    'Kambu Adai',
    'Podalaga Undai',
    'Adhurusam'
  ];

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate, selectedProduct]);

  const fetchSalesData = async () => {
    try {
      const response = await axios.get(`${API_URL}/bills`);
      let filteredData = response.data.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate >= startDate && billDate <= endDate;
      });

      if (selectedProduct !== 'all') {
        filteredData = filteredData.filter(bill => bill.product === selectedProduct);
      }

      // Group by date
      const groupedByDate = filteredData.reduce((acc, bill) => {
        const date = bill.date;
        if (!acc[date]) {
          acc[date] = { date, total: 0, quantity: 0 };
        }
        acc[date].total += parseFloat(bill.total_price);
        acc[date].quantity += parseInt(bill.quantity);
        return acc;
      }, {});

      const chartData = Object.values(groupedByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
      setSalesData(chartData);

      // Monthly comparison
      const currentMonth = new Date().getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const currentYear = new Date().getFullYear();
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthData = filteredData.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
      });

      const lastMonthData = filteredData.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate.getMonth() === lastMonth && billDate.getFullYear() === lastMonthYear;
      });

      const currentMonthTotal = currentMonthData.reduce((sum, bill) => sum + parseFloat(bill.total_price), 0);
      const lastMonthTotal = lastMonthData.reduce((sum, bill) => sum + parseFloat(bill.total_price), 0);

      setMonthlyComparison([
        { month: format(new Date(lastMonthYear, lastMonth), 'MMM yyyy'), total: lastMonthTotal },
        { month: format(new Date(currentYear, currentMonth), 'MMM yyyy'), total: currentMonthTotal }
      ]);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const handleDownloadPDF = () => {
    // PDF generation will be implemented in the next step
    console.log('PDF download functionality to be implemented');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Sales Analysis
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Product</InputLabel>
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              label="Product"
            >
              {products.map((product) => (
                <MenuItem key={product} value={product}>
                  {product === 'all' ? 'All Products' : product}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadPDF}
            fullWidth
            sx={{ height: '100%' }}
          >
            Download PDF
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Sales
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total Sales" fill="#8884d8" />
                <Bar dataKey="quantity" name="Quantity" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total Sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Analysis; 