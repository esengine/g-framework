import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';

import TrafficDashboard from "./components/TrafficDashboard";
import UserManagement from "./components/UserManagement";
import RoomManagement from "./components/RoomManagement";

function App() {
    return (
        <Router>
            <Navbar bg="dark" expand="lg" variant="dark">
                <Navbar.Brand href="/">后台管理</Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link as={Link} to="/">流量面板</Nav.Link>
                    <Nav.Link as={Link} to="/users">用户管理</Nav.Link>
                    <Nav.Link as={Link} to="/rooms">房间管理</Nav.Link>
                </Nav>
            </Navbar>

            <Routes>
                <Route path="/" element={<TrafficDashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/rooms" element={<RoomManagement />} />
            </Routes>
        </Router>
    );
}

export default App;
