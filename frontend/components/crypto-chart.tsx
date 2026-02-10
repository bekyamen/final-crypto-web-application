'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  IChartApi,
  UTCTimestamp,
} from 'lightweight-charts';

/* =========================
   Types
   ========================= */
type TF = '1s' | '1m' | '15m' | '1h' | '4h' | '1d';

type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

interface CryptoChartProps {
  pair: string;
  price?: number;
  change24h?: number;
}


/* =========================
   Component
   ========================= */
export function CryptoChart({ pair }: CryptoChartProps) {
  const chartEl = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);

  const candles = useRef<Candle[]>([]);
  const ws = useRef<WebSocket | null>(null);

  const candleSeries = useRef<any>(null);
  const volumeSeries = useRef<any>(null);
  const ma7 = useRef<any>(null);
  const ma14 = useRef<any>(null);
  const ma28 = useRef<any>(null);

  const [tf, setTf] = useState<TF>('15m');

  // Header state
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);
  const [high24h, setHigh24h] = useState<number | null>(null);
  const [low24h, setLow24h] = useState<number | null>(null);

  const symbol = pair.replace('/', ''); // BTCUSDT
  const isPositive = (change24h ?? 0) >= 0;

  /* =========================
     Chart Init
     ========================= */
  useEffect(() => {
    if (!chartEl.current) return;

    chart.current = createChart(chartEl.current, {
      layout: {
        background: { color: '#071225' },
        textColor: '#b9c3d6',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.06)' },
        horzLines: { color: 'rgba(255,255,255,0.06)' },
      },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.1)' },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.1)',
        timeVisible: true,
        secondsVisible: true,
      },
      crosshair: { mode: 1 },
    });

    candleSeries.current = chart.current.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      borderVisible: false,
    });

    volumeSeries.current = chart.current.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.current.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    ma7.current = chart.current.addSeries(LineSeries, { color: '#f5c400', lineWidth: 2 });
    ma14.current = chart.current.addSeries(LineSeries, { color: '#00d0ff', lineWidth: 2 });
    ma28.current = chart.current.addSeries(LineSeries, { color: '#a64cff', lineWidth: 2 });

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

  /* =========================
     Fetch header & chart data
     ========================= */
  useEffect(() => {
    fetchHeader();
    loadHistory();
    connectWS();
    return () => ws.current?.close();
  }, [tf, symbol]);

  // Fetch current price & 24h stats from Binance
  async function fetchHeader() {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, { cache: 'no-store' });
      const data = await res.json();
      setPrice(parseFloat(data.lastPrice));
      setChange24h(parseFloat(data.priceChangePercent));
      setHigh24h(parseFloat(data.highPrice));
      setLow24h(parseFloat(data.lowPrice));
    } catch (err) {
      console.error('Failed to fetch header data:', err);
      setPrice(null);
      setChange24h(null);
      setHigh24h(null);
      setLow24h(null);
    }
  }

  /* =========================
     Load History
     ========================= */
  async function loadHistory() {
    const interval = tf === '1s' ? '1m' : tf;
    const res = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${interval}`, { cache: 'no-store' });
    const raw = await res.json();

    candles.current = raw.map((k: any) => ({
      time: Math.floor(k[0] / 1000) as UTCTimestamp,
      open: +k[1],
      high: +k[2],
      low: +k[3],
      close: +k[4],
      volume: +k[5],
    }));

    renderChart(true);
  }

  /* =========================
     WebSocket
     ========================= */
  function connectWS() {
    ws.current?.close();

    if (tf === '1s') {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`);
      ws.current.onmessage = e => build1sCandle(JSON.parse(e.data));
      return;
    }

    ws.current = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${tf}`);
    ws.current.onmessage = e => {
      const k = JSON.parse(e.data).k;
      updateCandle({
        time: Math.floor(k.t / 1000) as UTCTimestamp,
        open: +k.o,
        high: +k.h,
        low: +k.l,
        close: +k.c,
        volume: +k.v,
      });
    };
  }

  function updateCandle(c: Candle) {
    const last = candles.current[candles.current.length - 1];
    if (last && last.time === c.time) Object.assign(last, c);
    else candles.current.push(c);
    renderChart(false);
  }

  function build1sCandle(t: any) {
    const time = Math.floor(t.T / 1000) as UTCTimestamp;
    const price = +t.p;
    const qty = +t.q;
    const last = candles.current[candles.current.length - 1];

    if (!last || last.time !== time) {
      candles.current.push({ time, open: price, high: price, low: price, close: price, volume: qty });
    } else {
      last.high = Math.max(last.high, price);
      last.low = Math.min(last.low, price);
      last.close = price;
      last.volume += qty;
    }
    renderChart(false);
  }

  function calcSMA(len: number) {
    let sum = 0;
    return candles.current
      .map((c, i) => {
        sum += c.close;
        if (i >= len) sum -= candles.current[i - len].close;
        if (i < len - 1) return null;
        return { time: c.time, value: +(sum / len).toFixed(2) };
      })
      .filter(Boolean) as { time: UTCTimestamp; value: number }[];
  }

  function renderChart(fit: boolean) {
    candleSeries.current?.setData(candles.current);
    volumeSeries.current?.setData(
      candles.current.map(c => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(38,166,154,0.5)' : 'rgba(239,83,80,0.5)',
      }))
    );
    ma7.current?.setData(calcSMA(7));
    ma14.current?.setData(calcSMA(14));
    ma28.current?.setData(calcSMA(28));
    if (fit) chart.current?.timeScale().fitContent();
  }

  /* =========================
     UI
     ========================= */
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-end gap-4 mb-4">
          <div>
            <div className="text-white text-5xl font-bold">{price ? price.toFixed(5) : '--'}</div>
            <div className="text-slate-400 text-sm mt-1">USD</div>
          </div>
          <div className={`text-2xl font-semibold mb-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {price ? `${isPositive ? '+' : ''}${change24h?.toFixed(2)}%` : '--'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-slate-500 text-xs mb-1">24h High</div>
            <div className="text-white font-medium">{high24h ? high24h.toFixed(5) : '--'}</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-1">24h Low</div>
            <div className="text-white font-medium">{low24h ? low24h.toFixed(5) : '--'}</div>
          </div>
        </div>
      </div>

      {/* Timeframe buttons */}
      <div className="flex gap-2 mb-4">
        {(['1s', '1m', '15m', '1h', '4h', '1d'] as TF[]).map(x => (
          <button
            key={x}
            onClick={() => setTf(x)}
            className={`px-3 py-1 rounded text-sm ${
              tf === x ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {x}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div ref={chartEl} className="h-[600px] w-full" />
    </div>
  );
}
