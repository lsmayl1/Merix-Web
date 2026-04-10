import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/Logo/LogoMain";
import LogoName from "../../assets/Logo/LogoName";

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeIndustry, setActiveIndustry] = useState(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    setShowLangMenu(false);
  };

  const currentLang = i18n.language || localStorage.getItem("language") || "az";

  const langLabels = {
    az: "AZ",
    en: "EN",
    ru: "RU",
  };

  const industries = [
    {
      icon: "🏪",
      title: t("home.groceryTitle"),
      desc: t("home.groceryDesc"),
      features: [t("home.grocery1"), t("home.grocery2"), t("home.grocery3")],
    },
    {
      icon: "🏬",
      title: t("home.convenienceTitle"),
      desc: t("home.convenienceDesc"),
      features: [t("home.convenience1"), t("home.convenience2"), t("home.convenience3")],
    },
    {
      icon: "👗",
      title: t("home.fashionTitle"),
      desc: t("home.fashionDesc"),
      features: [t("home.fashion1"), t("home.fashion2"), t("home.fashion3")],
    },
    {
      icon: "🏗️",
      title: t("home.hardwareTitle"),
      desc: t("home.hardwareDesc"),
      features: [t("home.hardware1"), t("home.hardware2"), t("home.hardware3")],
    },
    {
      icon: "☕",
      title: t("home.cafeTitle"),
      desc: t("home.cafeDesc"),
      features: [t("home.cafe1"), t("home.cafe2"), t("home.cafe3")],
    },
    {
      icon: "💊",
      title: t("home.pharmacyTitle"),
      desc: t("home.pharmacyDesc"),
      features: [t("home.pharmacy1"), t("home.pharmacy2"), t("home.pharmacy3")],
    },
  ];

  const faqs = [
    { q: t("home.faq1Q"), a: t("home.faq1A") },
    { q: t("home.faq2Q"), a: t("home.faq2A") },
    { q: t("home.faq3Q"), a: t("home.faq3A") },
    { q: t("home.faq4Q"), a: t("home.faq4A") },
    { q: t("home.faq5Q"), a: t("home.faq5A") },
    { q: t("home.faq6Q"), a: t("home.faq6A") },
    { q: t("home.faq7Q"), a: t("home.faq7A") },
    { q: t("home.faq8Q"), a: t("home.faq8A") },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <LogoName className={"size-28"} />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">
                {t("home.featuresTitle")}
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition">
                {t("home.benefitsTitle")}
              </a>
              <a href="#industries" className="text-gray-600 hover:text-gray-900 transition">
                {t("home.industriesTitle")}
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
                {t("home.pricingTitle")}
              </a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition">
                {t("home.faqTitle")}
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span className="font-medium text-gray-700">{langLabels[currentLang]}</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${showLangMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
                    {Object.entries(langLabels).map(([lng, label]) => (
                      <button
                        key={lng}
                        onClick={() => changeLanguage(lng)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition ${currentLang === lng ? "bg-gray-100 font-semibold" : ""}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition">
                {currentLang === "az" ? "Daxil ol" : currentLang === "ru" ? "Войти" : "Sign In"}
              </Link>
              <Link to="/register" className="bg-[#4F46E5] text-white px-5 py-2.5 rounded-lg hover:bg-[#4338CA] transition font-medium">
                {currentLang === "az" ? "Başla" : currentLang === "ru" ? "Начать" : "Get Started"}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#EEF2FF] via-white to-[#F5F3FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-[#EEF2FF] text-[#4F46E5] rounded-full text-sm font-medium mb-6">
              {t("home.trustedBy")}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {t("home.heroTitle")}{" "}
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
                {t("home.heroHighlight")}
              </span>{" "}
              {t("home.heroTitle2")}
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              {t("home.heroDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-[#4F46E5] text-white px-8 py-4 rounded-xl hover:bg-[#4338CA] transition font-semibold text-lg shadow-lg shadow-[#4F46E5]/20"
              >
                {t("home.startFreeTrial")}
              </Link>
              <Link
                to="/demo"
                className="w-full sm:w-auto bg-white text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition font-semibold text-lg border border-gray-200"
              >
                {t("home.watchDemo")}
              </Link>
            </div>
            <p className="mt-6 text-gray-500 text-sm">
              {t("home.noCreditCard")} · {t("home.freeTrial")} · {t("home.setupInMinutes")}
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("home.problemTitle")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("home.problemSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("home.problem1Title")}
              </h3>
              <p className="text-gray-600">{t("home.problem1Desc")}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("home.problem2Title")}
              </h3>
              <p className="text-gray-600">{t("home.problem2Desc")}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {t("home.problem3Title")}
              </h3>
              <p className="text-gray-600">{t("home.problem3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {t("home.solutionTitle")}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t("home.solutionSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155]">
              <div className="w-12 h-12 bg-[#4F46E5] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 36v-3m-3 3h.01M9 17h.01M9 21h5.01M9 21v-3a1 1 0 011-1h5.01a1 1 0 011 1v3m-6-6h6m-6 4h6m-6-8h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t("home.posTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("home.posDesc")}</p>
            </div>
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155]">
              <div className="w-12 h-12 bg-[#7C3AED] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t("home.inventoryTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("home.inventoryDesc")}</p>
            </div>
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155]">
              <div className="w-12 h-12 bg-[#EC4899] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t("home.analyticsTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("home.analyticsDesc")}</p>
            </div>
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-[#334155]">
              <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t("home.teamTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("home.teamDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("home.featuresTitle")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("home.featuresSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#EEF2FF] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("home.fifoTitle")}</h3>
              <p className="text-gray-600">{t("home.fifoDesc")}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#F5F3FF] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("home.paymentTitle")}</h3>
              <p className="text-gray-600">{t("home.paymentDesc")}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#FCE7F3] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#EC4899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("home.barcodeTitle")}</h3>
              <p className="text-gray-600">{t("home.barcodeDesc")}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#D1FAE5] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("home.realtimeTitle")}</h3>
              <p className="text-gray-600">{t("home.realtimeDesc")}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("home.supplierTitle")}</h3>
              <p className="text-gray-600">{t("home.supplierDesc")}</p>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition">
              <div className="w-12 h-12 bg-[#DBEAFE] rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("home.securityTitle")}</h3>
              <p className="text-gray-600">{t("home.securityDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("home.benefitsTitle")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("home.benefitsSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#4F46E5] mb-2">40%</div>
              <p className="text-gray-700 font-medium mb-2">{t("home.fasterCheckouts")}</p>
              <p className="text-gray-500 text-sm">{t("home.fasterCheckoutsDesc")}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#7C3AED] mb-2">25%</div>
              <p className="text-gray-700 font-medium mb-2">{t("home.higherMargins")}</p>
              <p className="text-gray-500 text-sm">{t("home.higherMarginsDesc")}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#EC4899] mb-2">90%</div>
              <p className="text-gray-700 font-medium mb-2">{t("home.fewerErrors")}</p>
              <p className="text-gray-500 text-sm">{t("home.fewerErrorsDesc")}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#10B981] mb-2">15 {currentLang === "az" ? "saat" : currentLang === "ru" ? "часов" : "hrs"}</div>
              <p className="text-gray-700 font-medium mb-2">{t("home.hoursSaved")}</p>
              <p className="text-gray-500 text-sm">{t("home.hoursSavedDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("home.industriesTitle")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("home.industriesSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 border-2 cursor-pointer transition ${
                  activeIndustry === index
                    ? "border-[#4F46E5] bg-[#EEF2FF]"
                    : "border-gray-200 bg-white hover:border-[#4F46E5]/50"
                }`}
                onClick={() => setActiveIndustry(activeIndustry === index ? null : index)}
              >
                <div className="text-4xl mb-4">{industry.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{industry.title}</h3>
                <p className="text-gray-600 mb-4">{industry.desc}</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  {industry.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg className="w-4 h-4 text-[#4F46E5] mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("home.howItWorksTitle")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("home.howItWorksSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4F46E5] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("home.step1Title")}</h3>
              <p className="text-gray-600">{t("home.step1Desc")}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4F46E5] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("home.step2Title")}</h3>
              <p className="text-gray-600">{t("home.step2Desc")}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4F46E5] text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t("home.step3Title")}</h3>
              <p className="text-gray-600">{t("home.step3Desc")}</p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-flex items-center bg-[#4F46E5] text-white px-8 py-4 rounded-xl hover:bg-[#4338CA] transition font-semibold text-lg shadow-lg shadow-[#4F46E5]/20"
            >
              {t("home.startFreeTrial")}
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("home.socialProofTitle")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("home.socialProofSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{t("home.testimonial1")}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  AY
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t("home.testimonial1Name")}</p>
                  <p className="text-gray-500 text-sm">{t("home.testimonial1Role")}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{t("home.testimonial2")}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  RK
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t("home.testimonial2Name")}</p>
                  <p className="text-gray-500 text-sm">{t("home.testimonial2Role")}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{t("home.testimonial3")}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#EC4899] to-[#F59E0B] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  FM
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t("home.testimonial3Name")}</p>
                  <p className="text-gray-500 text-sm">{t("home.testimonial3Role")}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-gray-500 text-sm">{t("home.activeBusinesses")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">1M+</div>
              <div className="text-gray-500 text-sm">{t("home.transactionsMonthly")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">99.9%</div>
              <div className="text-gray-500 text-sm">{t("home.uptimeSLA")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-gray-500 text-sm">{t("home.localSupport")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("home.pricingTitle")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("home.pricingSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("home.starter")}</h3>
              <p className="text-gray-500 mb-6">{t("home.starterDesc")}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">₼49</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1 {t("home.posTerminal")}
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  1,000 {t("home.products")}
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.basicReports")}
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.emailSupport")}
                </li>
              </ul>
              <Link to="/register" className="block w-full bg-[#EEF2FF] text-[#4F46E5] text-center py-3 rounded-xl hover:bg-[#E0E7FF] transition font-semibold">
                {t("home.startFreeTrial")}
              </Link>
            </div>
            <div className="bg-[#0F172A] rounded-2xl p-8 border-2 border-[#4F46E5] relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#4F46E5] text-white px-4 py-1 rounded-full text-sm font-medium">
                {t("home.mostPopular")}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t("home.professional")}</h3>
              <p className="text-gray-400 mb-6">{t("home.professionalDesc")}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">₼99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  3 {t("home.posTerminal")}
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.products")} ∞
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.advancedAnalytics")}
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.supplierManagement")}
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.prioritySupport")}
                </li>
              </ul>
              <Link to="/register" className="block w-full bg-[#4F46E5] text-white text-center py-3 rounded-xl hover:bg-[#4338CA] transition font-semibold">
                {t("home.startFreeTrial")}
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("home.enterprise")}</h3>
              <p className="text-gray-500 mb-6">{t("home.enterpriseDesc")}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">₼199</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.unlimitedTerminals")}
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.multiLocation")}
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.customIntegrations")}
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.dedicatedManager")}
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-[#10B981] mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t("home.phoneSupport")}
                </li>
              </ul>
              <Link to="/register" className="block w-full bg-[#EEF2FF] text-[#4F46E5] text-center py-3 rounded-xl hover:bg-[#E0E7FF] transition font-semibold">
                {t("home.contactSales")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("home.faqTitle")}
            </h2>
            <p className="text-xl text-gray-600">{t("home.faqSubtitle")}</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition flex justify-between items-center"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition ${openFaq === index ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-gray-600">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t("home.finalCtaTitle")}
          </h2>
          <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            {t("home.finalCtaDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-white text-[#4F46E5] px-8 py-4 rounded-xl hover:bg-gray-100 transition font-semibold text-lg shadow-lg"
            >
              {t("home.startFreeTrial")}
            </Link>
            <Link
              to="/demo"
              className="w-full sm:w-auto bg-transparent text-white px-8 py-4 rounded-xl hover:bg-white/10 transition font-semibold text-lg border-2 border-white/30"
            >
              {t("home.scheduleDemo")}
            </Link>
          </div>
          <p className="text-indigo-200 text-sm">
            {t("home.freeTrial")} · {t("home.noCreditCard")} · {t("home.setupInMinutes")} · {currentLang === "az" ? "İstənilən vaxt ləğv edin" : currentLang === "ru" ? "Отмена в любое время" : "Cancel anytime"}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-lg"></div>
                <span className="text-xl font-bold text-white">Merix</span>
              </div>
              <p className="text-gray-400 text-sm">{t("home.footerDesc")}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footerProduct")}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">{t("home.featuresTitle")}</a></li>
                <li><a href="#pricing" className="hover:text-white transition">{t("home.pricingTitle")}</a></li>
                <li><a href="#industries" className="hover:text-white transition">{t("home.industriesTitle")}</a></li>
                <li><a href="#faq" className="hover:text-white transition">{t("home.faqTitle")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footerCompany")}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">{t("home.footerAbout")}</a></li>
                <li><a href="#" className="hover:text-white transition">{t("home.footerContact")}</a></li>
                <li><a href="#" className="hover:text-white transition">{t("home.footerCareers")}</a></li>
                <li><a href="#" className="hover:text-white transition">{t("home.footerBlog")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footerLegal")}</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">{t("home.footerPrivacy")}</a></li>
                <li><a href="#" className="hover:text-white transition">{t("home.footerTerms")}</a></li>
                <li><a href="#" className="hover:text-white transition">{t("home.footerSecurity")}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1E293B] mt-12 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Merix. {t("home.footerRights")}
          </div>
        </div>
      </footer>

      {/* Click outside to close language menu */}
      {showLangMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)}></div>
      )}
    </div>
  );
};

export default HomePage;
