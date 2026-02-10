// lib/binance.ts
export const BINANCE_REST = 'https://api.binance.com';
export const BINANCE_WS   = 'wss://stream.binance.com:9443/ws';



export function mapKline(k: any) {
  return {
    time: Math.floor(k[0] / 1000),
    open: +k[1],
    high: +k[2],
    low:  +k[3],
    close:+k[4],
    volume:+k[5],
  };
}

