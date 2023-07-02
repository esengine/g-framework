import React from 'react';
import { Table, Card, Badge } from 'react-bootstrap';

const userData = [
    { id: 1, name: 'User 1', role: 'Admin', lastLogin: '2023-01-01' },
    { id: 2, name: 'User 2', role: 'User', lastLogin: '2023-02-01' },
    { id: 3, name: 'User 3', role: 'User', lastLogin: '2023-03-01' },
];

const UserManagement = () => {
    return (
        <Card>
            <Card.Body>
                <Card.Title>用户管理 <Badge bg="secondary">{userData.length}</Badge></Card.Title>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Last Login</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userData.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.role}</td>
                            <td>{user.lastLogin}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default UserManagement;
