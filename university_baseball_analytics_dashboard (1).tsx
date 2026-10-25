import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import {
  Activity, Users, Target, PlusCircle, Filter, ChevronDown,
  TrendingUp, Award, Search, Zap, Shield, Eye, BarChart2, Calendar,
  Database, Download, Upload, Trash2, Edit3, UserPlus, Save, RefreshCw,
  PieChart, Compass, FileSpreadsheet, ArrowUpRight
} from 'lucide-react';

// --- INITIAL DEFAULT SAMPLE DATA (立命館大学風のサンプルデータ) ---
const DEFAULT_PLAYERS = [
  {
    id: 'p1',
    number: '18',
    name: '山本 翔太',
    position: 'Pitcher',
    throwBat: '右投右打',
    year: '4年',
    maxVelocity: '154.2',
    targetMetrics: '直球回転数2,450rpm / 縦変化量45cmオーバー',
    tags: ['エース', '高回転ファストボール', '奪三振率高'],
    era: '1.85',
    whip: '0.92',
    ip: '68.0',
    so: 82
  },
  {
    id: 'p2',
    number: '11',
    name: '佐藤 健斗',
    position: 'Pitcher',
    throwBat: '左投左打',
    year: '3年',
    maxVelocity: '146.5',
    targetMetrics: 'チェンジアップの再現性と横変化拡張',
    tags: ['変幻自在', '右打者キラー', 'グラウンドボール'],
    era: '2.45',
    whip: '1.10',
    ip: '44.0',
    so: 48
  },
  {
    id: 'b1',
    number: '1',
    name: '田中 陸',
    position: 'Batter',
    throwBat: '右投左打',
    year: '4年',
    maxVelocity: '162.0', // Max Exit Velocity
    targetMetrics: 'ハードヒット率45%以上 / バレル率12%',
    tags: ['主将', '広角打法', '選球眼◎'],
    avg: '.342',
    ops: '.965',
    hr: 5,
    rbi: 24
  },
  {
    id: 'b2',
    number: '7',
    name: '渡辺 匠',
    position: 'Batter',
    throwBat: '右投右打',
    year: '2年',
    maxVelocity: '168.5',
    targetMetrics: '長打率.550以上',
    tags: ['長距離砲', 'プルヒッター', '初球積極'],
    avg: '.288',
    ops: '.840',
    hr: 7,
    rbi: 21
  }
];

const DEFAULT_PITCH_LOGS = [
  { id: 'log1', pitcherId: 'p1', sessionType: 'Game', pitchType: '4-Seam', speed: 152.4, spinRate: 2420, spinEff: 96.2, spinAxis: '1:15', vBreak: 42.5, hBreak: -12.1, extension: 2.02, relHeight: 1.82, zone: 2, x: 0.1, y: 0.7, result: '空振り' },
  { id: 'log2', pitcherId: 'p1', sessionType: 'Game', pitchType: '4-Seam', speed: 151.0, spinRate: 2390, spinEff: 95.8, spinAxis: '1:12', vBreak: 40.8, hBreak: -10.5, extension: 2.00, relHeight: 1.81, zone: 1, x: -0.3, y: 0.8, result: 'ファール' },
  { id: 'log3', pitcherId: 'p1', sessionType: 'Game', pitchType: 'Slider', speed: 136.2, spinRate: 2680, spinEff: 42.0, spinAxis: '4:45', vBreak: 8.2, hBreak: 32.4, extension: 1.95, relHeight: 1.78, zone: 6, x: 0.6, y: 0.2, result: '見逃しストライク' },
  { id: 'log4', pitcherId: 'p1', sessionType: 'Bullpen', pitchType: 'Slider', speed: 138.0, spinRate: 2710, spinEff: 38.5, spinAxis: '4:30', vBreak: 5.1, hBreak: 35.0, extension: 1.94, relHeight: 1.76, zone: 9, x: 0.8, y: -0.4, result: 'ボール' },
  { id: 'log5', pitcherId: 'p1', sessionType: 'Bullpen', pitchType: 'Fork', speed: 139.5, spinRate: 1150, spinEff: 88.0, spinAxis: '2:00', vBreak: -15.2, hBreak: -8.0, extension: 1.98, relHeight: 1.80, zone: 8, x: -0.1, y: -0.6, result: 'ゴロ打ち取り' },
  { id: 'log6', pitcherId: 'p2', sessionType: 'Game', pitchType: '4-Seam', speed: 144.5, spinRate: 2280, spinEff: 92.0, spinAxis: '10:45', vBreak: 38.0, hBreak: 22.0, extension: 1.88, relHeight: 1.75, zone: 4, x: -0.4, y: 0.3, result: '空振り' },
  { id: 'log7', pitcherId: 'p2', sessionType: 'Game', pitchType: 'Changeup', speed: 131.0, spinRate: 1620, spinEff: 82.5, spinAxis: '10:15', vBreak: 15.4, hBreak: 38.2, extension: 1.85, relHeight: 1.72, zone: 7, x: 0.3, y: -0.5, result: '空振り' },
];

const DEFAULT_BATTING_LOGS = [
  { id: 'blog1', batterId: 'b1', sessionType: 'Game', pitcherHand: 'R', exitVelocity: 158.2, launchAngle: 18, distance: 102, trajectory: 'LineDrive', direction: 'RightCenter', result: '二塁打' },
  { id: 'blog2', batterId: 'b1', sessionType: 'Game', pitcherHand: 'R', exitVelocity: 162.0, launchAngle: 28, distance: 118, trajectory: 'Fly', direction: 'Right', result: '本塁打' },
  { id: 'blog3', batterId: 'b1', sessionType: 'LiveBP', pitcherHand: 'L', exitVelocity: 142.5, launchAngle: -4, distance: 45, trajectory: 'Grounder', direction: 'Center', result: '内野ゴロ' },
  { id: 'blog4', batterId: 'b2', sessionType: 'Game', pitcherHand: 'R', exitVelocity: 168.5, launchAngle: 32, distance: 122, trajectory: 'Fly', direction: 'Left', result: '本塁打' },
  { id: 'blog5', batterId: 'b2', sessionType: 'Game', pitcherHand: 'L', exitVelocity: 149.0, launchAngle: 12, distance: 78, trajectory: 'LineDrive', direction: 'LeftCenter', result: '安打' },
];

const PITCH_COLORS = {
  '4-Seam': '#ef4444',   // 赤
  'Slider': '#3b82f6',   // 青
  'Cutter': '#8b5cf6',   // 紫
  'Curveball': '#10b981',// 緑
  'Changeup': '#f59e0b', // アンバー
  'Fork': '#ec4899',     // ピンク
  'Sweeper': '#06b6d4'   // シアン
};

export default function App() {
  // --- LOCAL STORAGE PERSISTENCE ---
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('apex_baseball_players');
    return saved ? JSON.parse(saved) : DEFAULT_PLAYERS;
  });

  const [pitchLogs, setPitchLogs] = useState(() => {
    const saved = localStorage.getItem('apex_baseball_pitch_logs');
    return saved ? JSON.parse(saved) : DEFAULT_PITCH_LOGS;
  });

  const [battingLogs, setBattingLogs] = useState(() => {
    const saved = localStorage.getItem('apex_baseball_batting_logs');
    return saved ? JSON.parse(saved) : DEFAULT_BATTING_LOGS;
  });

  useEffect(() => {
    localStorage.setItem('apex_baseball_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('apex_baseball_pitch_logs', JSON.stringify(pitchLogs));
  }, [pitchLogs]);

  useEffect(() => {
    localStorage.setItem('apex_baseball_batting_logs', JSON.stringify(battingLogs));
  }, [battingLogs]);

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('roster'); // roster, pitching, batting, logger
  const [selectedPlayerId, setSelectedPlayerId] = useState(players[0]?.id || 'p1');
  const [sessionFilter, setSessionFilter] = useState('All'); // All, Game, Bullpen, LiveBP
  const [pitchTypeFilter, setPitchTypeFilter] = useState('All');

  // Modals / Editing States
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  // Player Form State
  const [playerFormData, setPlayerFormData] = useState({
    number: '',
    name: '',
    position: 'Pitcher',
    throwBat: '右投右打',
    year: '1年',
    maxVelocity: '',
    targetMetrics: '',
    tags: ''
  });

  // Pitch Input Form State
  const [newPitch, setNewPitch] = useState({
    pitcherId: selectedPlayerId,
    sessionType: 'Game',
    pitchType: '4-Seam',
    speed: 148.0,
    spinRate: 2300,
    spinEff: 95.0,
    spinAxis: '1:15',
    vBreak: 38.0,
    hBreak: -10.0,
    extension: 1.95,
    zone: 5,
    x: 0,
    y: 0,
    result: '空振り'
  });

  // Batting Input Form State
  const [newBatting, setNewBatting] = useState({
    batterId: selectedPlayerId,
    sessionType: 'Game',
    pitcherHand: 'R',
    exitVelocity: 150.0,
    launchAngle: 15,
    distance: 85,
    trajectory: 'LineDrive',
    direction: 'Center',
    result: '安打'
  });

  // Current Selected Player Object
  const selectedPlayer = useMemo(() => {
    return players.find(p => p.id === selectedPlayerId) || players[0] || {};
  }, [players, selectedPlayerId]);

  // Pitchers & Batters list
  const pitchers = useMemo(() => players.filter(p => p.position === 'Pitcher' || p.position === 'TwoWay'), [players]);
  const batters = useMemo(() => players.filter(p => p.position === 'Batter' || p.position === 'TwoWay'), [players]);

  // Selected Pitcher's Logs
  const filteredPitchLogs = useMemo(() => {
    return pitchLogs.filter(log => {
      const matchPitcher = log.pitcherId === selectedPlayerId;
      const matchSession = sessionFilter === 'All' || log.sessionType === sessionFilter;
      const matchType = pitchTypeFilter === 'All' || log.pitchType === pitchTypeFilter;
      return matchPitcher && matchSession && matchType;
    });
  }, [pitchLogs, selectedPlayerId, sessionFilter, pitchTypeFilter]);

  // Pitch Types Aggregated Stats
  const pitchTypeStats = useMemo(() => {
    const map = {};
    const total = filteredPitchLogs.length;

    filteredPitchLogs.forEach(log => {
      if (!map[log.pitchType]) {
        map[log.pitchType] = { name: log.pitchType, count: 0, speedSum: 0, spinSum: 0, vBreakSum: 0, hBreakSum: 0 };
      }
      map[log.pitchType].count += 1;
      map[log.pitchType].speedSum += Number(log.speed);
      map[log.pitchType].spinSum += Number(log.spinRate);
      map[log.pitchType].vBreakSum += Number(log.vBreak);
      map[log.pitchType].hBreakSum += Number(log.hBreak);
    });

    return Object.values(map).map(item => ({
      name: item.name,
      count: item.count,
      usage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
      avgSpeed: (item.speedSum / item.count).toFixed(1),
      avgSpin: Math.round(item.spinSum / item.count),
      avgVBreak: (item.vBreakSum / item.count).toFixed(1),
      avgHBreak: (item.hBreakSum / item.count).toFixed(1)
    }));
  }, [filteredPitchLogs]);

  // Selected Batter's Logs
  const filteredBattingLogs = useMemo(() => {
    return battingLogs.filter(log => {
      const matchBatter = log.batterId === selectedPlayerId;
      const matchSession = sessionFilter === 'All' || log.sessionType === sessionFilter;
      return matchBatter && matchSession;
    });
  }, [battingLogs, selectedPlayerId, sessionFilter]);

  // Batting Summary Stats
  const battingMetrics = useMemo(() => {
    if (filteredBattingLogs.length === 0) return { avgEv: 0, maxEv: 0, hardHitRate: 0, flyRate: 0 };
    const evs = filteredBattingLogs.map(b => Number(b.exitVelocity));
    const maxEv = Math.max(...evs);
    const avgEv = (evs.reduce((a, b) => a + b, 0) / evs.length).toFixed(1);
    const hardHits = filteredBattingLogs.filter(b => Number(b.exitVelocity) >= 150).length;
    const hardHitRate = ((hardHits / filteredBattingLogs.length) * 100).toFixed(1);

    return { avgEv, maxEv, hardHitRate };
  }, [filteredBattingLogs]);

  // --- PLAYER HANDLERS ---
  const handleOpenPlayerModal = (player = null) => {
    if (player) {
      setEditingPlayer(player);
      setPlayerFormData({
        number: player.number,
        name: player.name,
        position: player.position,
        throwBat: player.throwBat,
        year: player.year,
        maxVelocity: player.maxVelocity || '',
        targetMetrics: player.targetMetrics || '',
        tags: Array.isArray(player.tags) ? player.tags.join(', ') : ''
      });
    } else {
      setEditingPlayer(null);
      setPlayerFormData({
        number: '',
        name: '',
        position: 'Pitcher',
        throwBat: '右投右打',
        year: '1年',
        maxVelocity: '',
        targetMetrics: '',
        tags: ''
      });
    }
    setIsPlayerModalOpen(true);
  };

  const handleSavePlayer = (e) => {
    e.preventDefault();
    const tagArray = playerFormData.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingPlayer) {
      // Update
      setPlayers(players.map(p => p.id === editingPlayer.id ? {
        ...p,
        ...playerFormData,
        tags: tagArray
      } : p));
    } else {
      // Create
      const newId = 'p_' + Date.now();
      const newP = {
        id: newId,
        ...playerFormData,
        tags: tagArray,
        era: '0.00',
        whip: '0.00',
        ip: '0.0',
        so: 0
      };
      setPlayers([...players, newP]);
      setSelectedPlayerId(newId);
    }
    setIsPlayerModalOpen(false);
  };

  const handleDeletePlayer = (id) => {
    if (window.confirm('この選手データおよび関連ログを削除してもよろしいですか？')) {
      setPlayers(players.filter(p => p.id !== id));
      setPitchLogs(pitchLogs.filter(l => l.pitcherId !== id));
      setBattingLogs(battingLogs.filter(l => l.batterId !== id));
      if (selectedPlayerId === id) {
        setSelectedPlayerId(players[0]?.id || '');
      }
    }
  };

  // --- LOG HANDLERS ---
  const handleAddPitchLog = (e) => {
    e.preventDefault();
    const created = {
      id: 'log_' + Date.now(),
      ...newPitch,
      pitcherId: selectedPlayerId,
      speed: Number(newPitch.speed),
      spinRate: Number(newPitch.spinRate),
      spinEff: Number(newPitch.spinEff),
      vBreak: Number(newPitch.vBreak),
      hBreak: Number(newPitch.hBreak),
      extension: Number(newPitch.extension)
    };
    setPitchLogs([created, ...pitchLogs]);
    alert('一球ピッチデータ（投球ログ）を追加しました！');
  };

  const handleAddBattingLog = (e) => {
    e.preventDefault();
    const created = {
      id: 'blog_' + Date.now(),
      ...newBatting,
      batterId: selectedPlayerId,
      exitVelocity: Number(newBatting.exitVelocity),
      launchAngle: Number(newBatting.launchAngle),
      distance: Number(newBatting.distance)
    };
    setBattingLogs([created, ...battingLogs]);
    alert('打撃飛散データ（バッティングログ）を追加しました！');
  };

  // --- EXPORT & IMPORT ---
  const handleExportJSON = () => {
    const data = { players, pitchLogs, battingLogs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rits_baseball_analytics_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.players && data.pitchLogs) {
          setPlayers(data.players);
          setPitchLogs(data.pitchLogs);
          if (data.battingLogs) setBattingLogs(data.battingLogs);
          alert('データのインポートが完了しました！');
        }
      } catch (err) {
        alert('ファイルの読み込みに失敗しました。フォーマットを確認してください。');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (window.confirm('初期サンプルデータにリセットしますか？現在の入力データは上書きされます。')) {
      setPlayers(DEFAULT_PLAYERS);
      setPitchLogs(DEFAULT_PITCH_LOGS);
      setBattingLogs(DEFAULT_BATTING_LOGS);
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col lg:flex-row antialiased">

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-full lg:w-72 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
              <Activity className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                APEX ANALYTICS
              </h1>
              <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">College Baseball Pro</p>
            </div>
          </div>
        </div>

        {/* Global Selected Player Switcher */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center justify-between">
            <span>分析対象 選手選択</span>
            <span className="text-cyan-400 text-[10px]">{players.length}名 登録中</span>
          </label>
          <div className="relative">
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 py-2.5 px-3 pr-8 rounded-xl text-sm font-bold focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
            >
              <optgroup label="投手陣 (Pitchers)">
                {pitchers.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name} ({p.year} / {p.throwBat})
                  </option>
                ))}
              </optgroup>
              <optgroup label="野手陣 (Batters)">
                {batters.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name} ({p.year} / {p.throwBat})
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setActiveTab('roster')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'roster'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>選手一覧・基本プロファイル</span>
          </button>

          <button
            onClick={() => setActiveTab('pitching')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'pitching'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>投手球質・Rapsodo分析</span>
          </button>

          <button
            onClick={() => setActiveTab('batting')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'batting'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>野手打撃・スプレーチャート</span>
          </button>

          <button
            onClick={() => setActiveTab('logger')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'logger'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>1球データ入力 & ログ管理</span>
          </button>
        </nav>

        {/* Data Import / Export Tools */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/40">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Data Management</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-2.5 rounded-lg text-xs font-medium transition border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>保存(JSON)</span>
            </button>
            <label className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-2.5 rounded-lg text-xs font-medium transition border border-slate-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>読込</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
          <button
            onClick={handleResetData}
            className="w-full flex items-center justify-center space-x-1 text-slate-500 hover:text-red-400 text-[11px] py-1 transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>初期データに戻す</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">

        {/* HEADER BAR: Selected Player Banner */}
        {selectedPlayer && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 rounded-2xl flex items-center justify-center shadow-inner">
                <span className="text-xl font-black text-cyan-400 font-mono">#{selectedPlayer.number}</span>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-black text-white">{selectedPlayer.name}</h2>
                  <span className="bg-cyan-500/20 text-cyan-300 font-bold px-2.5 py-0.5 rounded text-xs border border-cyan-500/30">
                    {selectedPlayer.position === 'Pitcher' ? '投手' : selectedPlayer.position === 'Batter' ? '野手' : '二刀流'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{selectedPlayer.year} / {selectedPlayer.throwBat}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                  <span className="text-slate-300 font-medium">目標指標: {selectedPlayer.targetMetrics || '未設定'}</span>
                </p>
              </div>
            </div>

            {/* Custom Tag Badges */}
            <div className="flex flex-wrap gap-1.5">
              {selectedPlayer.tags && selectedPlayer.tags.map((tag, idx) => (
                <span key={idx} className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                  #{tag}
                </span>
              ))}
              <button
                onClick={() => handleOpenPlayerModal(selectedPlayer)}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-400 p-2 rounded-lg border border-slate-700 transition ml-2"
                title="選手プロファイルを編集"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 1: ROSTER & PLAYER MANAGEMENT --- */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">部員データベース & ロースター管理</h3>
                <p className="text-xs text-slate-400">チームの全選手データ、球速目標、アナリスト評価タグの閲覧・編集が可能です。</p>
              </div>
              <button
                onClick={() => handleOpenPlayerModal(null)}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 hover:opacity-95 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>新規選手を追加</span>
              </button>
            </div>

            {/* Roster Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {players.map((p) => (
                <div
                  key={p.id}
                  className={`bg-slate-900 border rounded-2xl p-5 transition relative flex flex-col justify-between ${
                    p.id === selectedPlayerId ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-black text-lg text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                          #{p.number}
                        </span>
                        <div>
                          <h4 className="font-bold text-base text-white">{p.name}</h4>
                          <p className="text-xs text-slate-400">{p.year} / {p.throwBat}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {p.position === 'Pitcher' ? '投手' : p.position === 'Batter' ? '野手' : '二刀流'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs border-t border-b border-slate-800/80 py-3 my-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">最高球速/打撃速度:</span>
                        <span className="font-bold text-emerald-400 font-mono">{p.maxVelocity ? `${p.maxVelocity} km/h` : '未計測'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">目標指標:</span>
                        <span className="text-slate-200 truncate max-w-[180px]" title={p.targetMetrics}>{p.targetMetrics || '-'}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {p.tags && p.tags.map((t, idx) => (
                        <span key={idx} className="bg-slate-950 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-800">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => setSelectedPlayerId(p.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                        p.id === selectedPlayerId
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {p.id === selectedPlayerId ? '選択中' : '分析対象に設定'}
                    </button>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleOpenPlayerModal(p)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title="編集"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(p.id)}
                        className="p-1.5 bg-slate-800 hover:bg-red-900/50 text-red-400 rounded-lg transition"
                        title="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 2: RAPSODO PITCHING ANALYTICS --- */}
        {activeTab === 'pitching' && (
          <div className="space-y-6">
            
            {/* Filter controls */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Rapsodo / TrackMan 球質・メカニクス分析</h3>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Session Filter */}
                <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold">区分:</span>
                  <select
                    value={sessionFilter}
                    onChange={(e) => setSessionFilter(e.target.value)}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="All">全セッション</option>
                    <option value="Game">試合 (Game)</option>
                    <option value="Bullpen">ブルペン (Bullpen)</option>
                    <option value="LiveBP">シート打撃 (Live BP)</option>
                  </select>
                </div>

                {/* Pitch Type Filter */}
                <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 font-semibold">球種:</span>
                  <select
                    value={pitchTypeFilter}
                    onChange={(e) => setPitchTypeFilter(e.target.value)}
                    className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="All">全球種</option>
                    <option value="4-Seam">ストレート</option>
                    <option value="Slider">スライダー</option>
                    <option value="Cutter">カットボール</option>
                    <option value="Curveball">カーブ</option>
                    <option value="Changeup">チェンジアップ</option>
                    <option value="Fork">フォーク</option>
                    <option value="Sweeper">スウィーパー</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pitch Movement Chart & Zone Matrix Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Pitch Movement Chart (Vertical vs Horizontal Break) */}
              <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-base">変化量プロファイル (Pitch Movement Plot)</h4>
                    <p className="text-xs text-slate-400">縦変化量 (cm) vs 横変化量 (cm) / 投手視点</p>
                  </div>
                  <span className="text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full font-mono">
                    計測数: {filteredPitchLogs.length}球
                  </span>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        type="number"
                        dataKey="hBreak"
                        name="横変化"
                        unit="cm"
                        domain={[-60, 60]}
                        stroke="#94a3b8"
                        fontSize={11}
                        label={{ value: '← アームサイド / グローブサイド →', position: 'bottom', fill: '#64748b', fontSize: 10 }}
                      />
                      <YAxis
                        type="number"
                        dataKey="vBreak"
                        name="縦変化"
                        unit="cm"
                        domain={[-60, 60]}
                        stroke="#94a3b8"
                        fontSize={11}
                        label={{ value: '縦変化量 (cm)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                      />
                      <ZAxis dataKey="speed" range={[80, 220]} name="球速" unit="km/h" />
                      <Tooltip
                        content={({ payload }) => {
                          if (payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                                <p className="font-bold text-cyan-400">{data.pitchType} ({data.sessionType})</p>
                                <p className="text-slate-300">球速: <span className="font-mono text-white font-bold">{data.speed} km/h</span></p>
                                <p className="text-slate-300">回転数: <span className="font-mono text-white">{data.spinRate} rpm</span> (効率: {data.spinEff}%)</p>
                                <p className="text-slate-300">回転軸: <span className="font-mono text-cyan-300">{data.spinAxis}</span></p>
                                <p className="text-slate-300">縦/横変化: <span className="font-mono text-emerald-400">{data.vBreak}cm / {data.hBreak}cm</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter data={filteredPitchLogs}>
                        {filteredPitchLogs.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PITCH_COLORS[entry.pitchType] || '#9ca3af'} stroke="#ffffff" strokeWidth={1} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pitch Command Matrix (Strike Zone Grid) */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-between space-y-4">
                <div className="w-full text-center">
                  <h4 className="font-bold text-white text-base">投球コース・ロケーション</h4>
                  <p className="text-xs text-slate-400 mt-0.5">捕手目線 ストライクゾーン配球</p>
                </div>

                <div className="relative w-64 h-64 bg-slate-950 rounded-2xl border border-slate-800 p-3 flex items-center justify-center">
                  {/* Strike Zone Grid Box */}
                  <div className="w-40 h-48 border-2 border-dashed border-cyan-500/40 relative grid grid-cols-3 grid-rows-3">
                    {[1,2,3,4,5,6,7,8,9].map(z => (
                      <div key={z} className="border border-slate-800/80 flex items-center justify-center text-[10px] text-slate-700 font-mono">
                        {z}
                      </div>
                    ))}
                  </div>

                  {/* Pitches Location Plot overlay */}
                  {filteredPitchLogs.map((p) => {
                    // x, y mapped to % inside box
                    const left = 50 + (p.x * 30);
                    const top = 50 - (p.y * 30);
                    return (
                      <div
                        key={p.id}
                        className="absolute w-3.5 h-3.5 rounded-full border border-white/60 transform -translate-x-1/2 -translate-y-1/2 shadow-lg transition hover:scale-150 cursor-pointer"
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          backgroundColor: PITCH_COLORS[p.pitchType] || '#fff'
                        }}
                        title={`${p.pitchType} ${p.speed}km/h - ${p.result}`}
                      />
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-2 text-[10px]">
                  {Object.entries(PITCH_COLORS).map(([pName, color]) => (
                    <span key={pName} className="flex items-center space-x-1 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }}></span>
                      <span>{pName}</span>
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Pitch Type Metrics Aggregated Table */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-white text-base mb-4">球種別平均データ (Pitch Metrics Summary)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 pb-3">
                      <th className="py-3 font-semibold">球種</th>
                      <th className="py-3 font-semibold">投球数</th>
                      <th className="py-3 font-semibold">配球割合 (%)</th>
                      <th className="py-3 font-semibold">平均球速 (km/h)</th>
                      <th className="py-3 font-semibold">平均回転数 (rpm)</th>
                      <th className="py-3 font-semibold">平均縦変化 (cm)</th>
                      <th className="py-3 font-semibold">平均横変化 (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200 font-mono">
                    {pitchTypeStats.map((st) => (
                      <tr key={st.name} className="hover:bg-slate-800/40">
                        <td className="py-3 font-sans font-bold flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PITCH_COLORS[st.name] }}></span>
                          <span>{st.name}</span>
                        </td>
                        <td className="py-3">{st.count}球</td>
                        <td className="py-3 text-cyan-400 font-bold">{st.usage}%</td>
                        <td className="py-3 text-white font-bold">{st.avgSpeed}</td>
                        <td className="py-3">{st.avgSpin}</td>
                        <td className="py-3 text-emerald-400">+{st.avgVBreak}</td>
                        <td className="py-3 text-blue-400">{st.avgHBreak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 3: BATTER & SPRAY CHART SCOUTING --- */}
        {activeTab === 'batting' && (
          <div className="space-y-6">

            {/* Batter Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">打球計測サンプル数</p>
                <p className="text-2xl font-black text-white font-mono mt-1">{filteredBattingLogs.length} <span className="text-xs font-normal text-slate-400">打席</span></p>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">平均打球速度 (Avg Exit Velo)</p>
                <p className="text-2xl font-black text-cyan-400 font-mono mt-1">{battingMetrics.avgEv} <span className="text-xs font-normal text-slate-400">km/h</span></p>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">最高打球速度 (Max Exit Velo)</p>
                <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{battingMetrics.maxEv} <span className="text-xs font-normal text-slate-400">km/h</span></p>
              </div>
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <p className="text-xs text-slate-400 font-medium">ハードヒット率 (≥150km/h)</p>
                <p className="text-2xl font-black text-purple-400 font-mono mt-1">{battingMetrics.hardHitRate} <span className="text-xs font-normal text-slate-400">%</span></p>
              </div>
            </div>

            {/* Spray Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Baseball Diamond Spray Chart Visualizer */}
              <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-between space-y-4">
                <div className="w-full flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-base">打球飛散チャート (Hit Spray Chart)</h4>
                    <p className="text-xs text-slate-400">打球方向・飛距離・打球種類のマップ</p>
                  </div>
                </div>

                {/* SVG Baseball Field */}
                <div className="relative w-full max-w-md h-80 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden p-4">
                  <svg viewBox="0 0 300 280" className="w-full h-full">
                    {/* Outfield Grass Arc */}
                    <path d="M 30,220 A 170,170 0 0,1 270,220 L 150,220 Z" fill="#0f291e" stroke="#10b981" strokeWidth="1.5" />
                    {/* Infield Dirt */}
                    <polygon points="150,220 100,170 150,120 200,170" fill="#2d1e18" stroke="#f59e0b" strokeWidth="1" />
                    {/* Foul Lines */}
                    <line x1="150" y1="220" x2="20" y2="90" stroke="#f8fafc" strokeWidth="1.5" />
                    <line x1="150" y1="220" x2="280" y2="90" stroke="#f8fafc" strokeWidth="1.5" />
                    {/* Home Plate */}
                    <polygon points="150,220 146,224 154,224" fill="#ffffff" />

                    {/* Plot Batted Balls */}
                    {filteredBattingLogs.map((b) => {
                      // Angle offset based on direction
                      let angle = 0; // Center
                      if (b.direction === 'Left') angle = -35;
                      if (b.direction === 'LeftCenter') angle = -18;
                      if (b.direction === 'RightCenter') angle = 18;
                      if (b.direction === 'Right') angle = 35;

                      const rad = (angle - 90) * (Math.PI / 180);
                      const distPx = Math.min(b.distance * 1.2, 150); // Scale distance
                      const cx = 150 + distPx * Math.cos(rad);
                      const cy = 220 + distPx * Math.sin(rad);

                      let color = '#3b82f6'; // LineDrive
                      if (b.trajectory === 'Fly') color = '#ef4444';
                      if (b.trajectory === 'Grounder') color = '#f59e0b';

                      return (
                        <g key={b.id} className="cursor-pointer hover:opacity-80">
                          <circle cx={cx} cy={cy} r="5" fill={color} stroke="#ffffff" strokeWidth="1" />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="flex space-x-6 text-xs">
                  <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span><span>ライナー</span></span>
                  <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span><span>フライ・本塁打</span></span>
                  <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span><span>ゴロ</span></span>
                </div>
              </div>

              {/* Batting Log History */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-white text-base mb-3">打撃ログ詳細</h4>
                <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
                  {filteredBattingLogs.map((log) => (
                    <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-cyan-400">{log.result} ({log.sessionType})</span>
                        <span className="text-slate-400 font-mono text-[10px]">対{log.pitcherHand}投手</span>
                      </div>
                      <div className="flex justify-between text-slate-300 font-mono">
                        <span>初速: {log.exitVelocity} km/h</span>
                        <span>角度: {log.launchAngle}°</span>
                        <span>飛距離: {log.distance}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- TAB 4: REAL-TIME DATA LOGGER & MANUAL INPUT --- */}
        {activeTab === 'logger' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Pitch Logger Form */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>投球データ (Pitch Log) 一球入力</span>
                </h3>
                <span className="text-xs text-slate-400">対象: #{selectedPlayer.number} {selectedPlayer.name}</span>
              </div>

              <form onSubmit={handleAddPitchLog} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">セッション区分</label>
                    <select
                      value={newPitch.sessionType}
                      onChange={(e) => setNewPitch({ ...newPitch, sessionType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Game">試合 (Game)</option>
                      <option value="Bullpen">ブルペン (Bullpen)</option>
                      <option value="LiveBP">シート打撃 (Live BP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">球種 (Pitch Type)</label>
                    <select
                      value={newPitch.pitchType}
                      onChange={(e) => setNewPitch({ ...newPitch, pitchType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="4-Seam">ストレート (4-Seam)</option>
                      <option value="Slider">スライダー</option>
                      <option value="Cutter">カットボール</option>
                      <option value="Curveball">カーブ</option>
                      <option value="Changeup">チェンジアップ</option>
                      <option value="Fork">フォーク</option>
                      <option value="Sweeper">スウィーパー</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">球速 (km/h)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newPitch.speed}
                      onChange={(e) => setNewPitch({ ...newPitch, speed: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">回転数 (rpm)</label>
                    <input
                      type="number"
                      value={newPitch.spinRate}
                      onChange={(e) => setNewPitch({ ...newPitch, spinRate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">回転効率 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newPitch.spinEff}
                      onChange={(e) => setNewPitch({ ...newPitch, spinEff: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">縦変化量 (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newPitch.vBreak}
                      onChange={(e) => setNewPitch({ ...newPitch, vBreak: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">横変化量 (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newPitch.hBreak}
                      onChange={(e) => setNewPitch({ ...newPitch, hBreak: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">投球結果 (Result)</label>
                  <select
                    value={newPitch.result}
                    onChange={(e) => setNewPitch({ ...newPitch, result: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="空振り">空振り</option>
                    <option value="見逃しストライク">見逃しストライク</option>
                    <option value="ファール">ファール</option>
                    <option value="ボール">ボール</option>
                    <option value="ゴロ打ち取り">ゴロ打ち取り</option>
                    <option value="フライ打ち取り">フライ打ち取り</option>
                    <option value="被安打">被安打</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-cyan-500/20 text-xs"
                >
                  投球ログを記録
                </button>
              </form>
            </div>

            {/* Batting Logger Form */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-bold text-white text-base flex items-center space-x-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>打撃・飛距離データ (Batting Log) 一球入力</span>
                </h3>
                <span className="text-xs text-slate-400">対象: #{selectedPlayer.number} {selectedPlayer.name}</span>
              </div>

              <form onSubmit={handleAddBattingLog} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">区分</label>
                    <select
                      value={newBatting.sessionType}
                      onChange={(e) => setNewBatting({ ...newBatting, sessionType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Game">試合 (Game)</option>
                      <option value="LiveBP">シート打撃 (Live BP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">相手投手 左右</label>
                    <select
                      value={newBatting.pitcherHand}
                      onChange={(e) => setNewBatting({ ...newBatting, pitcherHand: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="R">右投手 (RHP)</option>
                      <option value="L">左投手 (LHP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">打球初速 (km/h)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newBatting.exitVelocity}
                      onChange={(e) => setNewBatting({ ...newBatting, exitVelocity: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">打出角度 (°)</label>
                    <input
                      type="number"
                      value={newBatting.launchAngle}
                      onChange={(e) => setNewBatting({ ...newBatting, launchAngle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">推定飛距離 (m)</label>
                    <input
                      type="number"
                      value={newBatting.distance}
                      onChange={(e) => setNewBatting({ ...newBatting, distance: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">打球種類</label>
                    <select
                      value={newBatting.trajectory}
                      onChange={(e) => setNewBatting({ ...newBatting, trajectory: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="LineDrive">ライナー</option>
                      <option value="Fly">フライ</option>
                      <option value="Grounder">ゴロ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">打球方向</label>
                    <select
                      value={newBatting.direction}
                      onChange={(e) => setNewBatting({ ...newBatting, direction: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Left">レフト方向 (左)</option>
                      <option value="LeftCenter">左中間</option>
                      <option value="Center">センター方向 (中)</option>
                      <option value="RightCenter">右中間</option>
                      <option value="Right">ライト方向 (右)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">結果 (Result)</label>
                  <select
                    value={newBatting.result}
                    onChange={(e) => setNewBatting({ ...newBatting, result: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="安打">単打 (1B)</option>
                    <option value="二塁打">二塁打 (2B)</option>
                    <option value="三塁打">三塁打 (3B)</option>
                    <option value="本塁打">本塁打 (HR)</option>
                    <option value="アウト">アウト</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-500/20 text-xs"
                >
                  打撃ログを記録
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* --- EDIT / ADD PLAYER MODAL --- */}
      {isPlayerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg border-b border-slate-800 pb-3">
              {editingPlayer ? '選手プロファイルを編集' : '新規選手を登録'}
            </h3>

            <form onSubmit={handleSavePlayer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">背番号</label>
                  <input
                    type="text"
                    value={playerFormData.number}
                    onChange={(e) => setPlayerFormData({ ...playerFormData, number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="例: 18"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">選手名</label>
                  <input
                    type="text"
                    value={playerFormData.name}
                    onChange={(e) => setPlayerFormData({ ...playerFormData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="例: 立命 太郎"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">ポジション</label>
                  <select
                    value={playerFormData.position}
                    onChange={(e) => setPlayerFormData({ ...playerFormData, position: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Pitcher">投手</option>
                    <option value="Batter">野手</option>
                    <option value="TwoWay">二刀流</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">学年</label>
                  <select
                    value={playerFormData.year}
                    onChange={(e) => setPlayerFormData({ ...playerFormData, year: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="1年">1年</option>
                    <option value="2年">2年</option>
                    <option value="3年">3年</option>
                    <option value="4年">4年</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">投打</label>
                  <input
                    type="text"
                    value={playerFormData.throwBat}
                    onChange={(e) => setPlayerFormData({ ...playerFormData, throwBat: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="右投右打"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">最高球速 / 打撃速度 (km/h)</label>
                <input
                  type="number"
                  step="0.1"
                  value={playerFormData.maxVelocity}
                  onChange={(e) => setPlayerFormData({ ...playerFormData, maxVelocity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                  placeholder="例: 152.0"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">目標指標・アナリストメモ</label>
                <input
                  type="text"
                  value={playerFormData.targetMetrics}
                  onChange={(e) => setPlayerFormData({ ...playerFormData, targetMetrics: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="例: 縦変化量40cm維持"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">タグ (カンマ区切り)</label>
                <input
                  type="text"
                  value={playerFormData.tags}
                  onChange={(e) => setPlayerFormData({ ...playerFormData, tags: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  placeholder="例: エース, 高回転ファストボール"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPlayerModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold rounded-xl hover:opacity-95 transition"
                >
                  保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}