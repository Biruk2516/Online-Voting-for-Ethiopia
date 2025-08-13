import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#FF6F91'];

const RegionStatsChart = ({ region }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token'); // Your auth token
        const res = await axios.get(`/api/auth/region-stats/${region}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Expected format: { result: [{ fullName, party, percentage }] }
        const formatted = res.data.result.map((c, index) => ({
          name: `${c.fullName} (${c.party})`,
          value: parseFloat(c.percentage),
          color: COLORS[index % COLORS.length],
        }));
        setData(formatted);
      } catch (error) {
        console.error('Error fetching region stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (region) {
      fetchStats();
    }
  }, [region]);

  if (loading) return <p>Loading regional stats...</p>;

  return (
    <div className="w-full h-96">
      <h2 className="text-xl font-bold mb-4 text-center">
        Vote Distribution in {region}
      </h2>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegionStatsChart;
