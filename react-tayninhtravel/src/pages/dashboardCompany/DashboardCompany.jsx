/* eslint-disable no-unused-vars */
import React from 'react'
import styled, { css } from "styled-components";
import Row from "../../ui/Row";
import DashboardLayout from '../../features/dashboard/dashboardCompany/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const Container = styled.div`
  margin: 2rem auto 3rem;
  display: flex;
  flex-direction: column;
  gap: 3.2rem;
`;

const Heading = styled.h1`
  margin-bottom: 0;
  ${(props) =>
    props.as === "h1" &&
    css`
      font-size: 3rem;
      font-weight: 600;
    `}

  text-align: left;
  line-height: 1.4;
`;

function DashboardAdmin() {
  const navigate = useNavigate();

  return (
    <Container>
      <Row type="horizontal">
        <Heading as="h1">Thống kê tổng quan</Heading>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Row>
      <DashboardLayout/>
    </Container>
  );
}

export default DashboardAdmin;
