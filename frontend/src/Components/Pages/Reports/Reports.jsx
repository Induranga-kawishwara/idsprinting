import * as React from "react";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { LineChart } from "@mui/x-charts/LineChart";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

export default function ReportPage() {
  const [connectNulls, setConnectNulls] = React.useState(true);

  const dailyIncome = [200, 250, 300, 270, 320, 310, 400];
  const monthlyIncome = [
    4500, 4800, 5000, 5300, 6000, 5800, 6200, 7000, 7200, 7500, 8000, 8500,
  ];
  const employeeSales = [15, 18, 13, 25, 30, 20, 22, 28, 24, 29];
  const creditCustomersLast12Days = [
    5, 8, 10, 7, 15, 12, 20, 18, 22, 17, 25, 30,
  ];
  const lifetimeCreditCustomers = 150;

  return (
    <Stack spacing={4} sx={{ width: "100%", padding: "20px" }}>
      <FormControlLabel
        checked={connectNulls}
        control={
          <Checkbox
            onChange={(event) => setConnectNulls(event.target.checked)}
          />
        }
        label="Connect Nulls"
        labelPlacement="end"
      />

      <Box component={Paper} elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Daily Income (Last 7 Days)
        </Typography>
        <LineChart
          xAxis={[{ data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }]}
          series={[{ data: dailyIncome, area: true }]}
          height={300}
          width="100%" // Make the chart responsive
          margin={{ top: 10, bottom: 30, left: 50, right: 10 }} // Add margins
        />
      </Box>

      <Box component={Paper} elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Income (Last 12 Months)
        </Typography>
        <LineChart
          xAxis={[
            {
              data: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
            },
          ]}
          series={[{ data: monthlyIncome, area: true }]}
          height={300}
          width="100%" // Responsive width
          margin={{ top: 10, bottom: 30, left: 50, right: 10 }}
        />
      </Box>

      <Box component={Paper} elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Employee Sale History
        </Typography>
        <LineChart
          xAxis={[
            {
              data: Array.from(
                { length: employeeSales.length },
                (_, i) => `Emp ${i + 1}`
              ),
            },
          ]}
          series={[{ data: employeeSales }]}
          height={300}
          width="100%"
          margin={{ top: 10, bottom: 30, left: 50, right: 10 }}
        />
      </Box>

      <Box component={Paper} elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
        <Typography variant="h6" gutterBottom>
          Credit Customers (Last 12 Days)
        </Typography>
        <LineChart
          xAxis={[
            { data: Array.from({ length: 12 }, (_, i) => `Day ${i + 1}`) },
          ]}
          series={[{ data: creditCustomersLast12Days }]}
          height={300}
          width="100%"
          margin={{ top: 10, bottom: 30, left: 50, right: 10 }}
        />
      </Box>

      <Box component={Paper} elevation={3} sx={{ padding: 2 }}>
        <Typography variant="h6" gutterBottom>
          Lifetime Credit Customers
        </Typography>
        <Typography variant="h4">{lifetimeCreditCustomers}</Typography>
      </Box>
    </Stack>
  );
}
