import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Tab,
  Tabs
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import Analysis from './components/Analysis';
import API_URL from './config';

const products = [
  'Kai Muruku',
  'Achu Muruku',
  'Kothu Muruku',
  'Adai',
  'Kambu Adai',
  'Podalaga Undai',
  'Adhurusam'
];

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTab, setCurrentTab] = useState(0);
  const [currentMonthTotal, setCurrentMonthTotal] = useState(0);
  
  const [bills, setBills] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
    product: '',
    quantity: '',
    base_price: '',
    total_price: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await axios.get(`${API_URL}/bills`);
      setBills(response.data);
      
      // Calculate current month's total
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthStart = startOfMonth(new Date(currentYear, currentMonth));
      const monthEnd = endOfMonth(new Date(currentYear, currentMonth));
      
      const currentMonthBills = response.data.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate >= monthStart && billDate <= monthEnd;
      });
      
      const total = currentMonthBills.reduce((sum, bill) => sum + parseFloat(bill.total_price), 0);
      setCurrentMonthTotal(total);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'quantity' || name === 'base_price') {
        const quantity = name === 'quantity' ? value : prev.quantity;
        const basePrice = name === 'base_price' ? value : prev.base_price;
        newData.total_price = quantity && basePrice ? (quantity * basePrice).toString() : '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/bills/${editingId}`, formData);
      } else {
        await axios.post(`${API_URL}/bills`, formData);
      }
      fetchBills();
      resetForm();
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  const handleEdit = (bill) => {
    setFormData({
      date: bill.date,
      customer_name: bill.customer_name,
      product: bill.product,
      quantity: bill.quantity.toString(),
      base_price: bill.base_price.toString(),
      total_price: bill.total_price.toString()
    });
    setEditingId(bill.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/bills/${id}`);
      fetchBills();
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      customer_name: '',
      product: '',
      quantity: '',
      base_price: '',
      total_price: ''
    });
    setEditingId(null);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Bill Book Report', 14, 15);
    
    // Add current month total
    doc.setFontSize(12);
    doc.text(`Current Month Total: ₹${currentMonthTotal.toFixed(2)}`, 14, 25);
    
    // Add table
    doc.autoTable({
      startY: 35,
      head: [['Date', 'Customer', 'Product', 'Quantity', 'Base Price', 'Total']],
      body: bills.map(bill => [
        bill.date,
        bill.customer_name,
        bill.product,
        bill.quantity,
        bill.base_price,
        bill.total_price
      ]),
    });
    
    doc.save('billbook-report.pdf');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bill Book Management
          </Typography>
          <Typography variant="h6" component="div" sx={{ mr: 2 }}>
            Current Month: ₹{currentMonthTotal.toFixed(2)}
          </Typography>
          <Button color="inherit" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Bills" />
          <Tab label="Analysis" />
        </Tabs>

        {currentTab === 0 ? (
          <>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      name="date"
                      label="Date"
                      value={formData.date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="customer_name"
                      label="Customer Name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Product</InputLabel>
                      <Select
                        name="product"
                        value={formData.product}
                        onChange={handleInputChange}
                        label="Product"
                      >
                        {products.map((product) => (
                          <MenuItem key={product} value={product}>
                            {product}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      name="quantity"
                      label="Quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      name="base_price"
                      label="Base Price"
                      value={formData.base_price}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      name="total_price"
                      label="Total Price"
                      value={formData.total_price}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={resetForm}
                        disabled={!editingId}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        {editingId ? 'Update' : 'Save'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Base Price</TableCell>
                    <TableCell>Total Price</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.date}</TableCell>
                      <TableCell>{bill.customer_name}</TableCell>
                      <TableCell>{bill.product}</TableCell>
                      <TableCell>{bill.quantity}</TableCell>
                      <TableCell>{bill.base_price}</TableCell>
                      <TableCell>{bill.total_price}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(bill)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(bill.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Analysis />
        )}
      </Container>
    </>
  );
}

export default App; 