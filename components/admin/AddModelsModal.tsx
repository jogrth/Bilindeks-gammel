'use client';

import { useState } from 'react';
import { X, Plus, Loader as Loader2 } from 'lucide-react';

interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  failed: number;
  details: Array<{
    input: string;
    status: 'success' | 'error';
    message: string;
    model_id?: string;
  }>;
}

interface AddModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddModelsModal({ isOpen, onClose, onSuccess }: AddModelsModalProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/models/batch-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);

      if (data.success && (data.created > 0 || data.updated > 0)) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        created: 0,
        updated: 0,
        failed: 1,
        details: [{
          input: 'batch',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInput('');
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Legg til bil</h2>
            <p className="text-sm text-slate-600 mt-1">
              Skriv inn én eller flere modeller, én per linje
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Modeller
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Eksempel:&#10;Kia EV9&#10;Audi Q6 e-tron&#10;BMW i5 Touring&#10;Volvo EX30"
                  className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                  disabled={loading}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Hva skjer når du sender inn?
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Merker identifiseres eller opprettes automatisk</li>
                  <li>• Modeller opprettes som utkast</li>
                  <li>• Grunnleggende data lagres for videre redigering</li>
                  <li>• Du kan fylle ut resten manuelt etterpå</li>
                </ul>
              </div>
            </>
          ) : (
            <div>
              <div className={`rounded-lg p-6 mb-6 ${
                result.success && result.failed === 0
                  ? 'bg-green-50 border border-green-200'
                  : result.failed > 0 && result.created === 0
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <h3 className="text-lg font-bold mb-3">
                  {result.success && result.failed === 0 ? '✓ Vellykket' : result.failed > 0 && result.created === 0 ? '✗ Feilet' : '⚠ Delvis vellykket'}
                </h3>
                <div className="space-y-1 text-sm">
                  {result.created > 0 && (
                    <p className="text-green-700 font-medium">
                      {result.created} modell{result.created !== 1 ? 'er' : ''} opprettet
                    </p>
                  )}
                  {result.updated > 0 && (
                    <p className="text-blue-700 font-medium">
                      {result.updated} modell{result.updated !== 1 ? 'er' : ''} oppdatert
                    </p>
                  )}
                  {result.failed > 0 && (
                    <p className="text-red-700 font-medium">
                      {result.failed} modell{result.failed !== 1 ? 'er' : ''} feilet
                    </p>
                  )}
                </div>
              </div>

              {result.details && result.details.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Detaljer</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg text-sm ${
                          detail.status === 'success'
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`font-mono font-medium ${
                            detail.status === 'success' ? 'text-green-900' : 'text-red-900'
                          }`}>
                            {detail.input}
                          </span>
                        </div>
                        <p className={`mt-1 ${
                          detail.status === 'success' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {detail.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
          {!result ? (
            <>
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importerer...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Legg til
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
            >
              Lukk
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
