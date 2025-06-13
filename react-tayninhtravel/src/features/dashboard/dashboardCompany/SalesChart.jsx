/* eslint-disable react/prop-types */
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styled from "styled-components";
import Heading from "../../../ui/Heading";
import DashboardBox from "./DashboardBox";

import redLogo from "../../../assets/TNDT_Logo.png";
import greenLogo from "../../../assets/TNDT_Logo.png";

const StyledSalesChart = styled(DashboardBox)`
  grid-column: 1 / -1;
  border: none;
  padding: 16px;

  & .recharts-cartesian-grid-horizontal line,
  & .recharts-cartesian-grid-vertical line {
    stroke: var(--color-grey-300);
  }
`;

export default function SalesChart({ revenue }) {
  const isDarkMode = false;

  const colors = isDarkMode
    ? {
        red: { stroke: "#4f46e5", fill: "#4f46e5" },
        green: { stroke: "#22c55e", fill: "#22c55e" },
        text: "#e5e7eb",
        background: "#18212f",
      }
    : {
        red: { stroke: "var(--color-error-700)", fill: "orange" },
        green: { stroke: "var(--color-green-400)", fill: "#dcfce7" },
        text: "#374151",
        background: "#fff",
      };

  return (
    <StyledSalesChart>
      <Heading as="h2">
        Thống kê tổng lợi nhuận và doanh thu
      </Heading>
      <ResponsiveContainer height={300} width="100%">
        <AreaChart data={revenue}>
          <XAxis
            dataKey="date"
            tick={{ fill: colors.text }}
            tickLine={{ stroke: colors.text }}
          />
          <YAxis
            tick={{ fill: colors.text }}
            tickLine={{ stroke: colors.text }}
          />
          <CartesianGrid strokeDasharray="4" />
          <Tooltip contentStyle={{ backgroundColor: colors.background }} />
          <Area
            dataKey="green"
            type="monotone"
            stroke={colors.green.stroke}
            fill={colors.green.fill}
            strokeWidth={2}
            name="Green"
            unit={
              <img
                src={greenLogo}
                alt="Green Logo"
                width="25"
                height="25"
                style={{ marginLeft: "5px" }}
              />
            }
          />
          <Area
            dataKey="red"
            type="monotone"
            stroke={colors.red.stroke}
            fill={colors.red.fill}
            strokeWidth={2}
            name="Red"
            unit={
              <img
                src={redLogo}
                alt="Red Logo"
                width="25"
                height="25"
                style={{ marginLeft: "5px" }}
              />
            }
          />
        </AreaChart>
      </ResponsiveContainer>
    </StyledSalesChart>
  );
}
