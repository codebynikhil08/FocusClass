import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

interface QRCodeDisplayProps {
  sessionCode: string;
  subject: string;
  className: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  sessionCode, 
  subject, 
  className 
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [targetHost, setTargetHost] = useState<'tunnel' | 'lan' | 'current'>('tunnel');

  const tunnelUrl = 'https://09fd1bd73611d3.lhr.life';
  const lanUrl = 'http://10.132.227.40:5173';

  const getBaseUrl = () => {
    if (targetHost === 'tunnel') return tunnelUrl;
    if (targetHost === 'lan') return lanUrl;
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // If viewed on localhost, fallback to LAN IP so phone doesn't fail
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return lanUrl;
      }
      return origin;
    }
    return lanUrl;
  };

  const joinUrl = `${getBaseUrl()}/?join=${sessionCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm transition-all ${isExpanded ? 'ring-4 ring-teal-500/20' : ''}`}>
      <div className="w-full flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Student QR Check-in
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 flex items-center gap-1"
          title="Toggle Projector Full Size"
        >
          {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isExpanded ? 'Normal' : 'Projector View'}</span>
        </button>
      </div>

      {/* QR Code Canvas */}
      <div className={`p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center transition-all ${isExpanded ? 'scale-110 sm:scale-125 my-6' : 'my-2'}`}>
        <QRCodeSVG
          value={joinUrl}
          size={isExpanded ? 260 : 180}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/favicon.svg",
            x: undefined,
            y: undefined,
            height: isExpanded ? 36 : 26,
            width: isExpanded ? 36 : 26,
            excavate: true,
          }}
        />
      </div>

      {/* Large Session Code Box */}
      <div className="mt-4 w-full max-w-xs">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Session Code
        </label>
        <div className="flex items-center justify-between bg-slate-50 border-2 border-dashed border-teal-300 rounded-xl px-4 py-2.5">
          <span className="font-mono text-2xl font-black tracking-widest text-teal-700">
            {sessionCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
            title="Copy Session Code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Network Host Switcher for Projector / Mobile */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-3 text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setTargetHost('tunnel')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            targetHost === 'tunnel'
              ? 'bg-white text-teal-700 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🌐 Public Mobile (Recommended)
        </button>
        <button
          type="button"
          onClick={() => setTargetHost('lan')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            targetHost === 'lan'
              ? 'bg-white text-teal-700 shadow-xs font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          📶 Local Wi-Fi
        </button>
      </div>

      {/* Info & Copy Link */}
      <p className="text-xs text-slate-500 mt-2 max-w-xs">
        Students can scan with any phone camera or visit link below:
      </p>

      <div className="mt-2.5 flex items-center gap-2">
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <ExternalLink className="w-3.5 h-3.5" />}
          {copiedLink ? 'Link Copied!' : 'Copy Mobile Join Link'}
        </button>
      </div>

      <div className="mt-2 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600 max-w-xs break-all select-all">
        {joinUrl}
      </div>
    </div>
  );
};
