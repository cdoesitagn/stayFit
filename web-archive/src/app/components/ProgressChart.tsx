import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DayData {
  date: string;
  calories: number;
  water: number;
}

interface ProgressChartProps {
  data: DayData[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data.map(d => ({
    name: new Date(d.date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' }),
    Calories: d.calories,
    'Nước (x10ml)': Math.round(d.water / 10),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="name" 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Area 
          type="monotone" 
          dataKey="Calories" 
          stroke="#f97316" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorCalories)" 
        />
        <Area 
          type="monotone" 
          dataKey="Nước (x10ml)" 
          stroke="#3b82f6" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorWater)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
