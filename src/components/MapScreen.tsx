/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ExternalLink, ShieldCheck, Clock, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { APP_CONFIG, CITIES } from '../config.ts';
import { STRINGS } from '../strings.ts';
import { CityOutlook, HourlyRiskResult } from '../types.ts';
import { UaeMap } from './UaeMap.tsx';
import { CityList } from './CityList.tsx';
import { TimelineChart } from './TimelineChart.tsx';
import { AdvicePanel } from './AdvicePanel.tsx';
import { WhyThisRating } from './WhyThisRating.tsx';

interface MapScreenProps {
  outlooks: Record<string, CityOutlook>;
  selectedCityId: string;
  onSelectCity: (cityId: string) => void;
  lastUpdatedFormatted: string;
  isDemoMode?: boolean;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  outlooks,
  selectedCityId,
  onSelectCity,
  lastUpdatedFormatted,
  isDemoMode = false,
}) => {
  const [viewMode, setViewMode] = useState<'highest12h' | 'now'>('now');

  // Currently selected city outlook
  const currentOutlook = outlooks[selectedCityId] || outlooks[APP_CONFIG.defaultSelectedCityId];

  // Selected hour index within the 12-hour outlook
  // When viewMode is 'now', default to current hour (0); when 'highest12h', default to peak hour
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(0);

  useEffect(() => {
    if (currentOutlook) {
      if (viewMode === 'now') {
        setSelectedHourIndex(0);
      } else {
        setSelectedHourIndex(currentOutlook.peakHourIndex);
      }
    }
  }, [currentOutlook?.city.id, viewMode, currentOutlook?.peakHourIndex]);

  const handleSelectViewMode = (mode: 'now' | 'highest12h') => {
    setViewMode(mode);
    if (currentOutlook) {
      if (mode === 'now') {
        setSelectedHourIndex(0);
      } else {
        setSelectedHourIndex(currentOutlook.peakHourIndex);
      }
    }
  };

  if (!currentOutlook) {
    return (
      <div className="p-8 text-center text-[#4A4F57]">
        Loading UAE DustWatch telemetry...
      </div>
    );
  }

  const selectedHourResult: HourlyRiskResult =
    currentOutlook.hourlyResults[selectedHourIndex] || currentOutlook.hourlyResults[0];

  const levelNowCfg = APP_CONFIG.colors[currentOutlook.levelNow];
  const peakLevelCfg = APP_CONFIG.colors[currentOutlook.peakLevel];
  const activePeriodLevel = viewMode === 'now' ? currentOutlook.levelNow : currentOutlook.peakLevel;
  const activePeriodScore = viewMode === 'now' ? currentOutlook.scoreNow : currentOutlook.peakScore;
  const activePeriodCfg = APP_CONFIG.colors[activePeriodLevel];

  const getConfidenceBadgeColor = (conf: 'Low' | 'Medium' | 'High') => {
    switch (conf) {
      case 'High':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Low':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toggle above the map */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-[#D5D9DF] rounded-lg p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4A4F57]">
            Risk Summary Period:
          </span>
          <div
            role="radiogroup"
            aria-label="Risk Summary Period Toggle"
            className="inline-flex rounded-md shadow-xs bg-gray-100 p-0.5 border border-[#D5D9DF]"
          >
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === 'now'}
              onClick={() => handleSelectViewMode('now')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer min-h-[38px] ${
                viewMode === 'now'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-700/20'
                  : 'text-[#4A4F57] hover:text-[#1A1A1A]'
              }`}
            >
              {STRINGS.toggles.now}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={viewMode === 'highest12h'}
              onClick={() => handleSelectViewMode('highest12h')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer min-h-[38px] ${
                viewMode === 'highest12h'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-700/20'
                  : 'text-[#4A4F57] hover:text-[#1A1A1A]'
              }`}
            >
              {STRINGS.toggles.highest12h}
            </button>
          </div>
        </div>

        <div className="text-xs text-[#4A4F57] flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{STRINGS.toggles.lastUpdated(lastUpdatedFormatted)}</span>
        </div>
      </div>

      {/* Main Grid: Left Map + City List (Desktop), Right Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Map & City List (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <UaeMap
            outlooks={outlooks}
            selectedCityId={selectedCityId}
            onSelectCity={onSelectCity}
            viewMode={viewMode}
            isDemoMode={isDemoMode}
          />

          <CityList
            outlooks={outlooks}
            selectedCityId={selectedCityId}
            onSelectCity={onSelectCity}
            viewMode={viewMode}
          />
        </div>

        {/* Right Column: Selected City Detailed Panel (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main City Summary Card */}
          <div className="bg-white border border-[#D5D9DF] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#4A4F57]">
                  Selected City
                </span>
                <h2 className="text-2xl font-bold text-[#1A1A1A]">
                  {currentOutlook.city.name}
                </h2>
              </div>

              {/* Confidence Badge & Reasons */}
              <div className="text-right">
                <div className="text-[11px] text-[#4A4F57] mb-0.5">
                  {STRINGS.panel.confidence}
                </div>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${getConfidenceBadgeColor(
                    currentOutlook.confidence
                  )}`}
                >
                  {currentOutlook.confidence} Confidence
                </span>
              </div>
            </div>

            {/* Confidence explanation reasons */}
            {currentOutlook.confidenceReasons.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 text-xs text-[#4A4F57] space-y-1">
                <div className="font-semibold text-[#1A1A1A] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-600" />
                  <span>Confidence Factors:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {currentOutlook.confidenceReasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Active Period Risk Summary Banner */}
            <div
              data-testid="risk-summary-banner"
              className={`p-4 rounded-lg border transition-colors ${
                viewMode === 'now' ? 'bg-blue-50/70 border-blue-200' : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-[#4A4F57]">
                    {viewMode === 'now' ? 'Current Risk Outlook (Now)' : '12-Hour Forecast Peak Risk'}
                  </span>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mt-0.5">
                    {viewMode === 'now' ? 'Risk Level Now' : `Forecast Peak (at ${currentOutlook.peakHourTime})`}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      backgroundColor: activePeriodCfg.badgeBg,
                      color: activePeriodCfg.badgeText,
                      borderColor: activePeriodCfg.border,
                    }}
                    className="px-3 py-1 rounded font-bold text-base border shadow-xs"
                  >
                    {activePeriodCfg.label}
                  </span>
                  <span className="text-sm font-bold text-[#1A1A1A] font-mono">
                    Score: {Math.round(activePeriodScore)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#4A4F57] mt-1.5 leading-relaxed">
                {viewMode === 'now'
                  ? `Computed from current hour atmospheric telemetry for ${currentOutlook.city.name}. Does not derive from forecast peak.`
                  : `Highest forecasted risk hour across the 12-hour outlook window (peak hour: ${currentOutlook.peakHourTime}).`}
              </p>
            </div>

            {/* Quick Metrics: Risk Now vs Highest in next 12h (Clickable to switch period) */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleSelectViewMode('now')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  viewMode === 'now'
                    ? 'bg-white border-2 border-[#1A56DB] shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-[#F6F7F9] border-[#D5D9DF] hover:bg-gray-100 hover:border-gray-300'
                }`}
                aria-pressed={viewMode === 'now'}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#4A4F57] font-medium">
                    {STRINGS.panel.riskNow}
                  </span>
                  {viewMode === 'now' && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      backgroundColor: levelNowCfg.badgeBg,
                      color: levelNowCfg.badgeText,
                      borderColor: levelNowCfg.border,
                    }}
                    className="px-2.5 py-0.5 rounded font-bold text-sm border"
                  >
                    {levelNowCfg.label}
                  </span>
                  <span className="text-xs text-[#4A4F57] font-mono">
                    ({Math.round(currentOutlook.scoreNow)})
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectViewMode('highest12h')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  viewMode === 'highest12h'
                    ? 'bg-white border-2 border-[#1A56DB] shadow-xs ring-2 ring-blue-500/20'
                    : 'bg-[#F6F7F9] border-[#D5D9DF] hover:bg-gray-100 hover:border-gray-300'
                }`}
                aria-pressed={viewMode === 'highest12h'}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#4A4F57] font-medium">
                    {STRINGS.panel.highestNext12h}
                  </span>
                  {viewMode === 'highest12h' && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    style={{
                      backgroundColor: peakLevelCfg.badgeBg,
                      color: peakLevelCfg.badgeText,
                      borderColor: peakLevelCfg.border,
                    }}
                    className="px-2.5 py-0.5 rounded font-bold text-sm border"
                  >
                    {peakLevelCfg.label}
                  </span>
                  <span className="text-xs text-[#4A4F57]">
                    {STRINGS.panel.atHour(currentOutlook.peakHourTime)}
                  </span>
                </div>
              </button>
            </div>

            {/* Best and Worst 3-Hour Windows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-gray-100">
              <div className="p-2.5 rounded-md border border-emerald-200 bg-emerald-50/50">
                <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1 mb-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{STRINGS.panel.bestWindow}</span>
                </div>
                <div className="text-sm font-bold text-[#1A1A1A]">
                  {currentOutlook.bestWindow.displayRange}
                </div>
                <div className="text-xs text-[#4A4F57] mt-0.5">
                  Est. {currentOutlook.bestWindow.level} (avg score {currentOutlook.bestWindow.averageScore})
                </div>
              </div>

              <div className="p-2.5 rounded-md border border-amber-200 bg-amber-50/50">
                <div className="text-xs font-semibold text-amber-900 flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
                  <span>{STRINGS.panel.worstWindow}</span>
                </div>
                <div className="text-sm font-bold text-[#1A1A1A]">
                  {currentOutlook.worstWindow.displayRange}
                </div>
                <div className="text-xs text-[#4A4F57] mt-0.5">
                  Est. {currentOutlook.worstWindow.level} (avg score {currentOutlook.worstWindow.averageScore})
                </div>
              </div>
            </div>
          </div>

          {/* 12-Hour Timeline */}
          <TimelineChart
            hourlyResults={currentOutlook.hourlyResults}
            selectedHourIndex={selectedHourIndex}
            onSelectHour={setSelectedHourIndex}
          />

          {/* Audience Advice Tabs */}
          <AdvicePanel outlook={currentOutlook} />

          {/* "Why This Rating" Box */}
          <WhyThisRating
            selectedHour={selectedHourResult}
            activeModelInfo={currentOutlook.activeModelInfo}
          />

          {/* Satellite Imagery Link */}
          <div className="bg-white border border-[#D5D9DF] rounded-lg p-3.5 shadow-xs flex items-center justify-between text-xs">
            <div>
              <a
                href={STRINGS.panel.satelliteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 text-sm"
              >
                <span>{STRINGS.panel.satelliteLink}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <p className="text-[#4A4F57] mt-0.5">{STRINGS.panel.satelliteNote}</p>
            </div>
          </div>

          {/* Panel Footer: Data sources & Last updated */}
          <div className="text-xs text-[#4A4F57] px-1 py-2 space-y-1">
            <p>{STRINGS.panel.dataSources}</p>
            <p>{STRINGS.toggles.lastUpdated(currentOutlook.fetchTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
