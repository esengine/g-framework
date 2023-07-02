import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
// import axios from 'axios';

const generateData = () => {
    const now = new Date();
    return { name: now.toLocaleTimeString(), pv: Math.floor(Math.random() * 1000), uv: Math.floor(Math.random() * 1000) };
};

const TrafficDashboard = () => {
    const [data, setData] = useState([generateData()]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         // 根据你的API调整URL和参数
    //         const result = await axios('/api/traffic');
    //         setData(result.data);
    //     };
    //
    //     fetchData();
    //
    //     const interval = setInterval(fetchData, 1000);
    //     return () => clearInterval(interval);
    // }, []);

    useEffect(() => {
        // 每秒添加一条新数据
        const interval = setInterval(() => {
            setData((currentData) => {
                const newData = [...currentData, generateData()];

                // 如果数据太多，可以删除旧数据
                return newData.length > 60 ? newData.slice(newData.length - 60) : newData;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AreaChart
            width={500}
            height={300}
            data={data}
            margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
            }}
        >
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
            <Area type="monotone" dataKey="pv" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
        </AreaChart>
    );
};

export default TrafficDashboard;