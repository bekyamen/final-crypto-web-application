'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  LineSeries,
  IChartApi,
  UTCTimestamp,
} from 'lightweight-charts';

// Replace with your actual metals REST + WS endpoints
const GOLD_WS = 'wss://stream.binance.com:9443/ws';
const GOLD_REST = 'https://api.binance.com/api/v3/klines';

type TF = '1s' | '1m' | '15m' | '1h' | '4h' | '1d';

type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

interface GoldChartProps {
  pair: string;      // e.g., "XAU/USD"
  price: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
}

export function GoldChart({ pair, price, change24h, high24h, low24h }: GoldChartProps) {
  const chartEl = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const candleSeries = useRef<any>(null);
  const ma7 = useRef<any>(null);
  const ma14 = useRef<any>(null);
  const ma28 = useRef<any>(null);

  const candles = useRef<Candle[]>([]);
  const [tf, setTf] = useState<TF>('15m');

  const isPositive = change24h >= 0;
  const symbol = pair.replace('/', '').toLowerCase(); // e.g., XAUUSD -> xauusd

  // =========================
  // Chart Initialization
  // =========================
  useEffect(() => {
    if (!chartEl.current) return;

    chart.current = createChart(chartEl.current, {
      layout: { background: { color: '#071225' }, textColor: '#b9c3d6' },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.06)' },
        horzLines: { color: 'rgba(255,255,255,0.06)' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.1)', timeVisible: true, secondsVisible: true },
    });

    // Candle / Line series
    candleSeries.current = chart.current.addSeries(LineSeries, {
      color: '#f5a623',
      lineWidth: 2,
    });

    // Moving averages
    ma7.current = chart.current.addSeries(LineSeries, { color: '#00ffb0', lineWidth: 2 });
    ma14.current = chart.current.addSeries(LineSeries, { color: '#00d0ff', lineWidth: 2 });
    ma28.current = chart.current.addSeries(LineSeries, { color: '#ff00ff', lineWidth: 2 });

    // Responsive
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      chart.current?.applyOptions({ width });
    });
    ro.observe(chartEl.current);

    return () => {
      ro.disconnect();
      chart.current?.remove();
    };
  }, []);

  // =========================
  // Fetch historical REST candles
  // =========================
  useEffect(() => {
    async function fetchHistory() {
      try {
        const tfParam = tf === '1s' ? '1s' : tf.toUpperCase(); // convert for Binance API if needed
        const res = await fetch(`${GOLD_REST}?symbol=${symbol}&interval=${tfParam}&limit=100`);
        const data = await res.json();
        candles.current = data.map((k: any) => ({
          time: Math.floor(k[0] / 1000),
          open: +k[1],
          high: +k[2],
          low: +k[3],
          close: +k[4],
          volume: +k[5],
        }));
        renderChart();
      } catch (err) {
        console.error('Failed to fetch gold history', err);
      }
    }
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tf, symbol]);

  // =========================
  // WebSocket for live updates
  // =========================
  useEffect(() => {
    ws.current?.close();
    ws.current = new WebSocket(`${GOLD_WS}/${symbol}@trade`);

    ws.current.onmessage = e => {
      const data = JSON.parse(e.data);
      const time = Math.floor(data.T / 1000) as UTCTimestamp;
      const price = +data.p;

      const last = candles.current[candles.current.length - 1];
      if (!last || last.time !== time) {
        candles.current.push({ time, open: price, high: price, low: price, close: price, volume: +data.q });
      } else {
        last.close = price;
        last.high = Math.max(last.high, price);
        last.low = Math.min(last.low, price);
        last.volume += +data.q;
      }

      renderChart();
    };

    return () => ws.current?.close();
  }, [symbol]);

  // =========================
  // Calculate SMA
  // =========================
  const calcSMA = (len: number) => {
    let sum = 0;
    return candles.current
      .map((c, i) => {
        sum += c.close;
        if (i >= len) sum -= candles.current[i - len].close;
        if (i < len - 1) return null;
        return { time: c.time, value: +(sum / len).toFixed(2) };
      })
      .filter(Boolean) as { time: UTCTimestamp; value: number }[];
  };

  const renderChart = () => {
    candleSeries.current?.setData(candles.current.map(c => ({ time: c.time, value: c.close })));
    ma7.current?.setData(calcSMA(7));
    ma14.current?.setData(calcSMA(14));
    ma28.current?.setData(calcSMA(28));
  };

  // =========================
  // Render UI
  // =========================
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-end gap-4 mb-4">
          <div>
            <div className="text-white text-5xl font-bold">{price ? price.toFixed(2) : '--'}</div>
            <div className="text-slate-400 text-sm mt-1">USD</div>
          </div>
          <div className={`text-2xl font-semibold mb-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {price ? `${isPositive ? '+' : ''}${change24h.toFixed(2)}%` : '--'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-slate-500 text-xs mb-1">24h High</div>
            <div className="text-white font-medium">{high24h ? high24h.toFixed(2) : '--'}</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-1">24h Low</div>
            <div className="text-white font-medium">{low24h ? low24h.toFixed(2) : '--'}</div>
          </div>
        </div>
      </div>

      {/* Time Frame Buttons */}
      <div className="flex gap-2 mb-6 pb-6 border-b border-slate-700">
        {(['1s', '1m', '15m', '1h', '4h', '1d'] as TF[]).map(time => (
          <button
            key={time}
            className={`px-4 py-2 rounded text-sm font-medium transition ${time === tf ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            onClick={() => setTf(time)}
          >
            {time}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div ref={chartEl} className="h-96 w-full rounded bg-gradient-to-b from-slate-800 to-slate-900" />

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700 text-xs">
        {['MA7', 'MA14', 'MA28'].map(ma => (
          <div key={ma}>
            <span className="text-slate-500">{ma}:</span>
            <span className="text-white ml-2">{price ? price.toFixed(2) : '--'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
