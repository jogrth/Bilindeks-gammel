'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Battery, Anchor, Users, Zap } from 'lucide-react';
import { Button } from './ui/Button';
import type { CarModel } from '@/types';
import {
  formatPrice,
  formatRange,
  formatTowing,
  formatSeats,
  formatChargeSpeed,
} from '@/lib/formatting';

export interface CarCardProps {
  model: CarModel;
  onGetOffer?: (model: CarModel) => void;
  showCompareCheckbox?: boolean;
  isSelected?: boolean;
  onToggleCompare?: (model: CarModel) => void;
}

export function CarCard({ model, onGetOffer, showCompareCheckbox, isSelected, onToggleCompare }: CarCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all duration-150 flex flex-col h-full">
      <div className="relative">
        <Link href={`/cars/${model.slug}`} className="block">
          <div className="aspect-video bg-slate-100 relative">
            {model.image_url ? (
              <Image
                src={model.image_url}
                alt={`${model.brand_name} ${model.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <span className="text-6xl">🚗</span>
              </div>
            )}
          </div>
        </Link>
        {showCompareCheckbox && (
          <div className="absolute top-3 right-3 z-10">
            <label
              className="flex items-center justify-center w-6 h-6 bg-white rounded border-2 border-slate-300 cursor-pointer hover:border-primary-500 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleCompare?.(model);
              }}
            >
              <input
                type="checkbox"
                checked={isSelected || false}
                onChange={() => {}}
                className="sr-only"
              />
              {isSelected && (
                <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </label>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/cars/${model.slug}`} className="block mb-3">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {model.brand_name} {model.name}
          </h3>
          <div className="flex gap-2 flex-wrap">
            {model.drivetrain && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-slate-100 text-slate-700">
                {model.drivetrain}
              </span>
            )}
            {model.drive_type && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-slate-100 text-slate-700">
                {model.drive_type}
              </span>
            )}
          </div>
        </Link>

        <div className="space-y-2 mb-4 flex-grow">
          <div className="flex items-center text-sm text-slate-600">
            <Battery className="w-4 h-4 mr-2 text-slate-400" />
            <span className="font-medium mr-1">Rekkevidde:</span>
            <span>{formatRange(model.range_wltp_km)}</span>
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <Anchor className="w-4 h-4 mr-2 text-slate-400" />
            <span className="font-medium mr-1">Hengerfeste:</span>
            <span>{formatTowing(model.towing_kg)}</span>
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <Users className="w-4 h-4 mr-2 text-slate-400" />
            <span className="font-medium mr-1">Seter:</span>
            <span>{formatSeats(model.seats_min, model.seats_max)}</span>
          </div>

          {model.charge_speed_kw && (
            <div className="flex items-center text-sm text-slate-600">
              <Zap className="w-4 h-4 mr-2 text-slate-400" />
              <span className="font-medium mr-1">Lading:</span>
              <span>{formatChargeSpeed(model.charge_speed_kw)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4 mt-auto">
          <div className="text-xl font-bold text-primary-700 mb-3">
            {formatPrice(model.price_from_nok)}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link href={`/cars/${model.slug}`}>
              <Button variant="secondary" size="sm" fullWidth>
                Utforsk
              </Button>
            </Link>
            <Button
              variant="accent"
              size="sm"
              fullWidth
              onClick={(e) => {
                e.preventDefault();
                onGetOffer?.(model);
              }}
            >
              Få tilbud
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
