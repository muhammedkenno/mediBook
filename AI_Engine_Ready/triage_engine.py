import re
import joblib

# 1. دالة تنظيف النص الأساسية بالمشروع
def clean_text(t):
    t = str(t).lower()
    t = re.sub(r"[^a-z\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

# 2. قواميس القواعد الطبية الصارمة الثابتة (Rule-Based)
emergency_rules = {
    "heart attack": "Yes", 
    "paralysis (brain hemorrhage)": "Yes", 
    "bronchial asthma": "No", 
    "pneumonia": "No"
}
infectious_rules = {
    "tuberculosis": "Yes", "malaria": "Yes", "pneumonia": "Yes", "chicken pox": "Yes",
    "typhoid": "Yes", "dengue": "Yes", "fungal infection": "Yes", "common cold": "Yes", "aids": "Yes"
}
CRITICAL_EMERGENCY_WORDS = ["chest pain", "crushing pain", "paralysis", "brain hemorrhage", "stroke", "severe bleeding"]

# 3. محرك الفحص الهجين المتكامل
def get_medical_triage(patient_symptoms, model_spec_path='final_specialty_model.pkl', model_dis_path='final_disease_model.pkl'):
    cleaned_text = clean_text(patient_symptoms)
    
    # تحميل النماذج الذكية المخزنة
    model_specialty = joblib.load(model_spec_path)
    model_disease = joblib.load(model_dis_path)
    
    # فحص الرايات الحمراء الفوري من النص لسلامة الطوارئ القصوى
    is_emergency = "No"
    for word in CRITICAL_EMERGENCY_WORDS:
        if word in cleaned_text:
            is_emergency = "Yes"
            break

    # التنبؤ الذكي عبر التعلم الآلي
    pred_specialty = model_specialty.predict([cleaned_text])[0]
    pred_disease = model_disease.predict([cleaned_text])[0] 
    
    norm_dis = str(pred_disease).lower().strip()
    norm_dis = re.sub(r"\s+", " ", norm_dis)
    
    # تطبيق نظام القواعد المستند للمرض
    if is_emergency == "No":
        is_emergency = emergency_rules.get(norm_dis, "No")
    is_infectious = infectious_rules.get(norm_dis, "No")
    
    if is_emergency == "Yes":
        pred_specialty = "Emergency"
        
    return {
        "user_symptoms": patient_symptoms,
        "predicted_disease": pred_disease.title(),
        "recommended_specialty": pred_specialty,
        "is_emergency": is_emergency,
        "is_infectious": is_infectious
    }