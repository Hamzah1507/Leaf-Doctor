import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// ============================================
// SAVE SEASONAL INSIGHT
// ============================================
export const saveSeasonalInsight = async (insightData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const newInsight = {
      userId: user.uid,
      userName: insightData.userName || 'Anonymous',
      userEmail: user.email || '',
      
      location: insightData.location || 'Unknown',
      
      // Weather Data
      temperature: insightData.temperature || 0,
      humidity: insightData.humidity || 0,
      weatherCondition: insightData.weatherCondition || 'Unknown',
      
      // Insight Information
      insightType: insightData.insightType, // 'temperature_alert', 'disease_alert', 'humidity_alert', 'seasonal_tip'
      insightContext: insightData.insightContext,
      
      // Additional metadata
      recommendation: insightData.recommendation || '',
      affectedPlants: insightData.affectedPlants || [],
      actionItems: insightData.actionItems || [],
      
      // Time
      savedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'user_seasonal_insights'), newInsight);
    return { id: docRef.id, ...newInsight };
  } catch (error) {
    console.error('Error saving insight:', error);
    throw error;
  }
};

// ============================================
// GET USER'S SAVED INSIGHTS
// ============================================
export const getUserSavedInsights = async (userId) => {
  try {
    const q = query(
      collection(db, 'user_seasonal_insights'),
      where('userId', '==', userId),
    );

    const snapshot = await getDocs(q);
    const insights = [];
    snapshot.forEach((doc) => {
      insights.push({ id: doc.id, ...doc.data() });
    });

    return insights;
  } catch (error) {
    console.error('Error getting user insights:', error);
    throw error;
  }
};

// ============================================
// DELETE INSIGHT
// ============================================
export const deleteInsight = async (insightId) => {
  try {
    await deleteDoc(doc(db, 'user_seasonal_insights', insightId));
  } catch (error) {
    console.error('Error deleting insight:', error);
    throw error;
  }
};

// ============================================
// GET ALL INSIGHTS (Admin - for dashboard)
// ============================================
export const getAllInsights = async () => {
  try {
    const q = query(
      collection(db, 'user_seasonal_insights'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    const insights = [];
    snapshot.forEach((doc) => {
      insights.push({ id: doc.id, ...doc.data() });
    });

    return insights;
  } catch (error) {
    console.error('Error getting all insights:', error);
    throw error;
  }
};

// ============================================
// GET INSIGHTS BY TYPE
// ============================================
export const getInsightsByType = async (insightType) => {
  try {
    const q = query(
      collection(db, 'user_seasonal_insights'),
      where('insightType', '==', insightType),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const insights = [];
    snapshot.forEach((doc) => {
      insights.push({ id: doc.id, ...doc.data() });
    });

    return insights;
  } catch (error) {
    console.error('Error getting insights by type:', error);
    throw error;
  }
};

// ============================================
// GET INSIGHTS BY LOCATION
// ============================================
export const getInsightsByLocation = async (location) => {
  try {
    const q = query(
      collection(db, 'user_seasonal_insights'),
      where('location', '==', location),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const insights = [];
    snapshot.forEach((doc) => {
      insights.push({ id: doc.id, ...doc.data() });
    });

    return insights;
  } catch (error) {
    console.error('Error getting insights by location:', error);
    throw error;
  }
};

// ============================================
// SEARCH INSIGHTS
// ============================================
export const searchInsights = async (searchTerm, userId = null) => {
  try {
    let q;

    if (userId) {
      // Search in user's insights only
      q = query(
        collection(db, 'user_seasonal_insights'),
        where('userId', '==', userId),
        orderBy('savedAt', 'desc')
      );
    } else {
      // Search in all insights (admin)
      q = query(
        collection(db, 'user_seasonal_insights'),
        orderBy('savedAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const insights = [];
    const searchLower = searchTerm.toLowerCase();

    snapshot.forEach((doc) => {
      const insight = { id: doc.id, ...doc.data() };

      // Search in context, location, and weather condition
      if (
        insight.insightContext.toLowerCase().includes(searchLower) ||
        insight.location.toLowerCase().includes(searchLower) ||
        insight.weatherCondition.toLowerCase().includes(searchLower) ||
        insight.userName.toLowerCase().includes(searchLower)
      ) {
        insights.push(insight);
      }
    });

    return insights;
  } catch (error) {
    console.error('Error searching insights:', error);
    throw error;
  }
};

// ============================================
// GET INSIGHTS ANALYTICS
// ============================================
export const getInsightsAnalytics = async () => {
  try {
    const allInsights = await getAllInsights();

    const analytics = {
      totalInsights: allInsights.length,
      
      // By Type
      byType: {
        temperature_alert: 0,
        disease_alert: 0,
        humidity_alert: 0,
        seasonal_tip: 0,
        other: 0,
      },
      
      // By Location
      byLocation: {},
      
      // Temperature Range
      avgTemperature: 0,
      avgHumidity: 0,
      
      // Most Common Weather
      weatherConditions: {},
      
      // Users Count
      uniqueUsers: new Set(),
    };

    let totalTemp = 0;
    let totalHumidity = 0;

    allInsights.forEach((insight) => {
      // Count by type
      if (analytics.byType[insight.insightType] !== undefined) {
        analytics.byType[insight.insightType]++;
      } else {
        analytics.byType.other++;
      }

      // Count by location
      if (!analytics.byLocation[insight.location]) {
        analytics.byLocation[insight.location] = 0;
      }
      analytics.byLocation[insight.location]++;

      // Sum temperature and humidity
      totalTemp += insight.temperature || 0;
      totalHumidity += insight.humidity || 0;

      // Count weather conditions
      if (!analytics.weatherConditions[insight.weatherCondition]) {
        analytics.weatherConditions[insight.weatherCondition] = 0;
      }
      analytics.weatherConditions[insight.weatherCondition]++;

      // Track unique users
      analytics.uniqueUsers.add(insight.userId);
    });

    // Calculate averages
    analytics.avgTemperature = allInsights.length > 0 ? Math.round(totalTemp / allInsights.length) : 0;
    analytics.avgHumidity = allInsights.length > 0 ? Math.round(totalHumidity / allInsights.length) : 0;
    analytics.uniqueUsers = analytics.uniqueUsers.size;

    return analytics;
  } catch (error) {
    console.error('Error getting insights analytics:', error);
    throw error;
  }
};

// ============================================
// GET INSIGHTS SUMMARY (for charts/dashboard)
// ============================================
export const getInsightsSummary = async () => {
  try {
    const analytics = await getInsightsAnalytics();

    const summary = {
      totalSaved: analytics.totalInsights,
      activeUsers: analytics.uniqueUsers,
      
      alerts: {
        temperature: analytics.byType.temperature_alert,
        disease: analytics.byType.disease_alert,
        humidity: analytics.byType.humidity_alert,
      },
      
      seasonalTips: analytics.byType.seasonal_tip,
      
      avgWeather: {
        temperature: analytics.avgTemperature,
        humidity: analytics.avgHumidity,
      },
      
      topLocations: Object.entries(analytics.byLocation)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([location, count]) => ({ location, count })),
      
      weatherBreakdown: analytics.weatherConditions,
    };

    return summary;
  } catch (error) {
    console.error('Error getting insights summary:', error);
    throw error;
  }
};

// ============================================
// GET RECENT INSIGHTS FOR HOME SCREEN
// ============================================
export const getRecentInsights = async (userId, limit_count = 5) => {
  try {
    const q = query(
      collection(db, 'user_seasonal_insights'),
      where('userId', '==', userId),
      limit(limit_count)
    );

    const snapshot = await getDocs(q);
    const insights = [];
    snapshot.forEach((doc) => {
      insights.push({ id: doc.id, ...doc.data() });
    });

    return insights;
  } catch (error) {
    console.error('Error getting recent insights:', error);
    throw error;
  }
};

// ============================================
// GET INSIGHTS BY TEMPERATURE RANGE
// ============================================
export const getInsightsByTemperatureRange = async (minTemp, maxTemp) => {
  try {
    const allInsights = await getAllInsights();

    const filtered = allInsights.filter(
      (insight) => insight.temperature >= minTemp && insight.temperature <= maxTemp
    );

    return filtered;
  } catch (error) {
    console.error('Error getting insights by temperature range:', error);
    throw error;
  }
};

// ============================================
// GET INSIGHTS BY HUMIDITY RANGE
// ============================================
export const getInsightsByHumidityRange = async (minHumidity, maxHumidity) => {
  try {
    const allInsights = await getAllInsights();

    const filtered = allInsights.filter(
      (insight) => insight.humidity >= minHumidity && insight.humidity <= maxHumidity
    );

    return filtered;
  } catch (error) {
    console.error('Error getting insights by humidity range:', error);
    throw error;
  }
};

// ============================================
// GET INSIGHTS FOR SPECIFIC DATE RANGE
// ============================================
export const getInsightsDateRange = async (startDate, endDate, userId = null) => {
  try {
    let q;

    if (userId) {
      q = query(
        collection(db, 'user_seasonal_insights'),
        where('userId', '==', userId),
        where('savedAt', '>=', startDate),
        where('savedAt', '<=', endDate),
        orderBy('savedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'user_seasonal_insights'),
        where('savedAt', '>=', startDate),
        where('savedAt', '<=', endDate),
        orderBy('savedAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const insights = [];
    snapshot.forEach((doc) => {
      insights.push({ id: doc.id, ...doc.data() });
    });

    return insights;
  } catch (error) {
    console.error('Error getting insights by date range:', error);
    throw error;
  }
};

// ============================================
// GET SINGLE INSIGHT DETAIL
// ============================================
export const getInsightDetail = async (insightId) => {
  try {
    const docRef = doc(db, 'user_seasonal_insights', insightId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Insight not found');
    }
  } catch (error) {
    console.error('Error getting insight detail:', error);
    throw error;
  }
};

export const getSavedInsights = getUserSavedInsights;


export default {
  saveSeasonalInsight,
  getUserSavedInsights,
  deleteInsight,
  getAllInsights,
  getInsightsByType,
  getInsightsByLocation,
  searchInsights,
  getInsightsAnalytics,
  getInsightsSummary,
  getRecentInsights,
  getSavedInsights,
  getInsightsByTemperatureRange,
  getInsightsByHumidityRange,
  getInsightsDateRange,
  getInsightDetail,
};