import React from 'react';
import { Table, Card, Badge } from 'react-bootstrap';

const roomData = [
    { id: 1, name: 'Room 1', capacity: 10, status: 'Available' },
    { id: 2, name: 'Room 2', capacity: 20, status: 'Occupied' },
    { id: 3, name: 'Room 3', capacity: 15, status: 'Available' },
];

const RoomManagement = () => {
    return (
        <Card>
            <Card.Body>
                <Card.Title>房间管理 <Badge bg="secondary">{roomData.length}</Badge></Card.Title>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Capacity</th>
                        <th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {roomData.map(room => (
                        <tr key={room.id}>
                            <td>{room.id}</td>
                            <td>{room.name}</td>
                            <td>{room.capacity}</td>
                            <td>{room.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default RoomManagement;
