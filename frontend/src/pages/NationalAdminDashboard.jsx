export function NationalAdminDashboard({ nationalStats }) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">National Results</h2>
      <PieChart width={500} height={400}>
        <Pie data={nationalStats.result} dataKey="percentage" nameKey="fullName" cx="50%" cy="50%" outerRadius={150}>
          {nationalStats.result.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}