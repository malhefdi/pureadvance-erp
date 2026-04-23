'use client';

import { useCallback, useRef } from 'react';
import type { ZonePIDData } from '@/types/pid-zone';

// ============================================================
// SVG → PNG EXPORT
// ============================================================

export function useExportSVG() {
  const exportAsPNG = useCallback((
    svgElement: SVGSVGElement | null,
    filename: string = 'pid-export.png',
    scale: number = 2
  ) => {
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svgElement.viewBox.baseVal.width * scale;
      canvas.height = svgElement.viewBox.baseVal.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw SVG
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Download
      canvas.toBlob(blob => {
        if (!blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }, 'image/png');

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const exportAsSVG = useCallback((
    svgElement: SVGSVGElement | null,
    filename: string = 'pid-export.svg'
  ) => {
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  return { exportAsPNG, exportAsSVG };
}

// ============================================================
// ZONE DATA → CSV EXPORT
// ============================================================

export function exportZoneAsCSV(zone: ZonePIDData) {
  const rows: string[] = [];

  // Equipment
  rows.push('=== EQUIPMENT ===');
  rows.push('Tag,Name,Vendor,Model,Status,Efficiency,Batch');
  zone.equipment.forEach(eq => {
    const status = zone.equipmentStatus.find(s => s.equipmentId === eq.id);
    rows.push([
      eq.tag,
      `"${eq.name}"`,
      eq.vendor || '',
      eq.model || '',
      status?.status || '',
      status?.efficiency || '',
      status?.batchId || '',
    ].join(','));
  });

  // Instruments
  rows.push('');
  rows.push('=== INSTRUMENTS ===');
  rows.push('Tag,Variable,Function,Range,Value,Unit,Setpoint,Alarm');
  zone.instruments.forEach(inst => {
    const val = zone.instrumentValues.find(v => v.instrumentId === inst.id);
    rows.push([
      inst.tag,
      inst.variable,
      inst.function,
      inst.range || '',
      val?.value?.toFixed(2) || '',
      val?.unit || '',
      val?.setpoint?.toFixed(2) || '',
      val?.alarmState || '',
    ].join(','));
  });

  // Control Loops
  rows.push('');
  rows.push('=== CONTROL LOOPS ===');
  rows.push('Tag,Name,Type,Variable,Setpoint,Output,AlarmHigh,AlarmLow');
  zone.controlLoops.forEach(loop => {
    rows.push([
      loop.tag,
      `"${loop.name}"`,
      loop.type,
      loop.measuredVariable,
      loop.setpoint,
      `"${loop.output}"`,
      loop.alarmHigh || '',
      loop.alarmLow || '',
    ].join(','));
  });

  // Valves
  rows.push('');
  rows.push('=== VALVES ===');
  rows.push('Valve,Position,PercentOpen,Mode');
  zone.valvePositions.forEach(v => {
    rows.push([v.valveId, v.position, v.percentOpen, v.mode].join(','));
  });

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${zone.drawingNumber}-data.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ============================================================
// PRINT-FRIENDLY LAYOUT
// ============================================================

export function triggerPrint() {
  window.print();
}
