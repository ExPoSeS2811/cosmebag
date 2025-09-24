import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bagService } from '../services/bagService';
import type { AestheticPassport, CosmetologistVisit } from '../types/database.types';
import { Sparkles, Calendar, AlertCircle, Heart, ChevronRight } from 'lucide-react';

export const PassportPage: React.FC = () => {
  const { user } = useAuth();
  const [passport, setPassport] = useState<AestheticPassport | null>(null);
  const [visits, setVisits] = useState<CosmetologistVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPassportData();
    }
  }, [user]);

  const loadPassportData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [passportData, visitsData] = await Promise.all([
        bagService.fetchPassport(user.id),
        bagService.fetchVisits(user.id)
      ]);

      setPassport(passportData);
      setVisits(visitsData);
    } catch (error) {
      console.error('Error loading passport data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkinTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      normal: 'Нормальная',
      dry: 'Сухая',
      oily: 'Жирная',
      combination: 'Комбинированная',
      sensitive: 'Чувствительная'
    };
    return labels[type] || type;
  };

  const getSkinTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      normal: 'bg-green-100 text-green-700',
      dry: 'bg-blue-100 text-blue-700',
      oily: 'bg-yellow-100 text-yellow-700',
      combination: 'bg-purple-100 text-purple-700',
      sensitive: 'bg-red-100 text-red-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <div className="flex items-center">
          <Sparkles className="w-8 h-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Эстетический паспорт</h1>
            <p className="text-white/80 text-sm mt-1">Ваш персональный beauty-профиль</p>
          </div>
        </div>
      </div>

      {passport ? (
        <div className="p-4 space-y-4">
          {/* Skin Type */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3">Тип кожи</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getSkinTypeColor(passport.skin_type)}`}>
              {getSkinTypeLabel(passport.skin_type)}
            </span>
          </div>

          {/* Skin Concerns */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Heart className="w-5 h-5 text-pink-500 mr-2" />
              Особенности кожи
            </h2>
            {passport.skin_concerns && passport.skin_concerns.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {passport.skin_concerns.map((concern, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                  >
                    {concern}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Не указаны</p>
            )}
          </div>

          {/* Allergies */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              Аллергии
            </h2>
            {passport.allergies && passport.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {passport.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Аллергии не обнаружены</p>
            )}
          </div>

          {/* Notes */}
          {passport.notes && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-3">Заметки</h2>
              <p className="text-gray-600 text-sm">{passport.notes}</p>
            </div>
          )}

          {/* Visits */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 text-purple-500 mr-2" />
                Визиты к косметологу ({visits.length})
              </h2>
            </div>

            {visits.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {visits.slice(0, 3).map((visit) => (
                  <div key={visit.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </p>
                        {visit.doctor_name && (
                          <p className="text-sm text-gray-600 mt-1">
                            Врач: {visit.doctor_name}
                          </p>
                        )}
                        {visit.procedures && visit.procedures.length > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            {visit.procedures.join(', ')}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">Визитов пока нет</p>
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Паспорт создан</p>
            <p className="text-sm font-medium mt-1">
              {new Date(passport.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="bg-white rounded-xl p-8 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Эстетический паспорт не найден</p>
          </div>
        </div>
      )}
    </div>
  );
};