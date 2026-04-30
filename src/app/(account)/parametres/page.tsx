"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Lock,
  Bell,
  Trash2,
  Loader2,
  Save,
  Phone,
  Mail,
  AlertTriangle,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  notifyBookingConfirmed: boolean;
  notifyBookingReminder: boolean;
  notifyMarketing: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────

function normalizePhone(value: string): string {
  // Strip non-digit chars except leading +
  let digits = value.replace(/[^\d+]/g, "");
  // Convert +212 prefix to 06
  if (digits.startsWith("+212")) {
    digits = "0" + digits.slice(4);
  } else if (digits.startsWith("212")) {
    digits = "0" + digits.slice(3);
  }
  return digits;
}

function formatPhoneDisplay(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("06")) {
    return `${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
  }
  return value;
}

// ─── Component ─────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications
  const [notifyBookingConfirmed, setNotifyBookingConfirmed] = useState(true);
  const [notifyBookingReminder, setNotifyBookingReminder] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);
  const [savingNotif, setSavingNotif] = useState<string | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ─── Fetch profile ──────────────────────────

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/user/profile");
      if (!res.ok) throw new Error("Erreur chargement profil");
      const data = await res.json();
      setProfile(data.user);
      setEditName(data.user.name || "");
      setEditPhone(data.user.phone || "");
      setNotifyBookingConfirmed(data.user.notifyBookingConfirmed ?? true);
      setNotifyBookingReminder(data.user.notifyBookingReminder ?? true);
      setNotifyMarketing(data.user.notifyMarketing ?? false);
    } catch {
      toast.error("Impossible de charger votre profil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
    if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, fetchProfile]);

  // ─── Save profile ───────────────────────────

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    const phoneDigits = normalizePhone(editPhone);
    if (phoneDigits && (phoneDigits.length !== 10 || !phoneDigits.startsWith("06"))) {
      toast.error("Numéro invalide. Format : 06XXXXXXXX ou +212 6XXXXXXXX");
      return;
    }
    try {
      setSavingProfile(true);
      const res = await fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          phone: phoneDigits || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur mise à jour");
      }
      const data = await res.json();
      setProfile((p) => (p ? { ...p, ...data.user } : data.user));
      await updateSession();
      toast.success("Profil mis à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setSavingProfile(false);
    }
  }

  // ─── Change password ────────────────────────

  function validatePassword(pw: string): string | null {
    if (pw.length < 8) return "8 caractères minimum";
    if (!/[A-Z]/.test(pw)) return "Au moins une majuscule";
    if (!/[a-z]/.test(pw)) return "Au moins une minuscule";
    if (!/\d/.test(pw)) return "Au moins un chiffre";
    return null;
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Entrez votre mot de passe actuel");
      return;
    }
    const pwErr = validatePassword(newPassword);
    if (pwErr) {
      toast.error(`Mot de passe invalide : ${pwErr}`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      setSavingPassword(true);
      const res = await fetch("/api/v1/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur changement mot de passe");
      }
      toast.success("Mot de passe modifié avec succès");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du changement de mot de passe");
    } finally {
      setSavingPassword(false);
    }
  }

  // ─── Toggle notification ─────────────────────

  async function handleToggleNotification(key: string, value: boolean) {
    setSavingNotif(key);
    try {
      const res = await fetch("/api/v1/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur mise à jour");
      }
      if (key === "notifyBookingConfirmed") setNotifyBookingConfirmed(value);
      if (key === "notifyBookingReminder") setNotifyBookingReminder(value);
      if (key === "notifyMarketing") setNotifyMarketing(value);
      toast.success("Préférence mise à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
      // Revert optimistic state
      if (key === "notifyBookingConfirmed") setNotifyBookingConfirmed(!value);
      if (key === "notifyBookingReminder") setNotifyBookingReminder(!value);
      if (key === "notifyMarketing") setNotifyMarketing(!value);
    } finally {
      setSavingNotif(null);
    }
  }

  // ─── Delete account ─────────────────────────

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "SUPPRIMER") {
      toast.error("Tapez SUPPRIMER pour confirmer");
      return;
    }
    try {
      setDeleting(true);
      const res = await fetch("/api/v1/user/account", {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur suppression");
      }
      toast.success("Compte supprimé. Déconnexion…");
      window.location.href = "/api/auth/signout";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  }

  // ─── Loading / unauthenticated ───────────────

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  if (status === "unauthenticated" || !profile) {
    return null;
  }

  // ─── Password strength indicator ─────────────

  const pwStrength = newPassword
    ? [
        newPassword.length >= 8,
        /[A-Z]/.test(newPassword),
        /[a-z]/.test(newPassword),
        /\d/.test(newPassword),
      ].filter(Boolean).length
    : 0;

  const pwStrengthLabel = ["", "Faible", "Moyen", "Bon", "Excellent"][pwStrength] || "";
  const pwStrengthColor = ["", "bg-red-400", "bg-orange-400", "bg-green-400", "bg-green-600"][pwStrength] || "";

  // ─── Render ──────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gérez votre profil, sécurité et préférences
        </p>
      </div>

      {/* ─── Section 1 : Profil ──────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-gray-900" />
          <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
        </div>

        <Card className="border rounded-md" style={{ borderColor: "rgba(198,198,198,0.2)" }}>
          <CardContent className="pt-6">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom complet
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={profile.email || ""}
                    readOnly
                    className="w-full h-10 rounded-md border border-gray-200 bg-gray-50 pl-10 pr-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">L&apos;e-mail ne peut pas être modifié</p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={editPhone ? formatPhoneDisplay(editPhone) : ""}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="06 XX XX XX XX"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Format marocain : 06XXXXXXXX ou +212 6XXXXXXXX</p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={savingProfile}
                  className="bg-black text-white hover:bg-gray-800 rounded-md"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ─── Section 2 : Mot de passe ──────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-gray-900" />
          <h2 className="text-lg font-semibold text-gray-900">Mot de passe</h2>
        </div>

        <Card className="border rounded-md" style={{ borderColor: "rgba(198,198,198,0.2)" }}>
          <CardContent className="pt-6">
            <form onSubmit={handleChangePassword} className="space-y-5">
              {/* Current password */}
              <div>
                <label htmlFor="current-pw" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    id="current-pw"
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label htmlFor="new-pw" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="new-pw"
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewPw(!showNewPw)}
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {newPassword && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            pwStrength >= i ? pwStrengthColor : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{pwStrengthLabel}</p>
                  </div>
                )}
                {newPassword && (
                  <ul className="mt-2 space-y-1">
                    <li className={`flex items-center gap-1.5 text-xs ${newPassword.length >= 8 ? "text-green-600" : "text-gray-400"}`}>
                      {newPassword.length >= 8 ? <Check className="h-3 w-3" /> : <span className="w-3" />}
                      8 caractères minimum
                    </li>
                    <li className={`flex items-center gap-1.5 text-xs ${/[A-Z]/.test(newPassword) ? "text-green-600" : "text-gray-400"}`}>
                      {/[A-Z]/.test(newPassword) ? <Check className="h-3 w-3" /> : <span className="w-3" />}
                      Une majuscule
                    </li>
                    <li className={`flex items-center gap-1.5 text-xs ${/[a-z]/.test(newPassword) ? "text-green-600" : "text-gray-400"}`}>
                      {/[a-z]/.test(newPassword) ? <Check className="h-3 w-3" /> : <span className="w-3" />}
                      Une minuscule
                    </li>
                    <li className={`flex items-center gap-1.5 text-xs ${/\d/.test(newPassword) ? "text-green-600" : "text-gray-400"}`}>
                      {/\d/.test(newPassword) ? <Check className="h-3 w-3" /> : <span className="w-3" />}
                      Un chiffre
                    </li>
                  </ul>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirm-pw" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="••••••••"
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={savingPassword}
                  className="bg-black text-white hover:bg-gray-800 rounded-md"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* ─── Section 3 : Notifications ──────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-gray-900" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>

        <Card className="border rounded-md" style={{ borderColor: "rgba(198,198,198,0.2)" }}>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Booking confirmed */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Confirmation de rendez-vous</p>
                  <p className="text-xs text-gray-500 mt-0.5">Recevoir un e-mail quand votre rendez-vous est confirmé</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifyBookingConfirmed}
                  onClick={() => handleToggleNotification("notifyBookingConfirmed", !notifyBookingConfirmed)}
                  disabled={savingNotif === "notifyBookingConfirmed"}
                  className={`relative inline-flex h-6 w-11 items-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 ${
                    notifyBookingConfirmed ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifyBookingConfirmed ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                  {savingNotif === "notifyBookingConfirmed" && (
                    <Loader2 className="absolute h-3 w-3 animate-spin text-white left-1/2 -translate-x-1/2" />
                  )}
                </button>
              </div>

              <div className="border-t" style={{ borderColor: "rgba(198,198,198,0.2)" }} />

              {/* Booking reminder */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Rappels de rendez-vous</p>
                  <p className="text-xs text-gray-500 mt-0.5">Recevoir un e-mail de rappel 24h et 1h avant</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifyBookingReminder}
                  onClick={() => handleToggleNotification("notifyBookingReminder", !notifyBookingReminder)}
                  disabled={savingNotif === "notifyBookingReminder"}
                  className={`relative inline-flex h-6 w-11 items-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 ${
                    notifyBookingReminder ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifyBookingReminder ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                  {savingNotif === "notifyBookingReminder" && (
                    <Loader2 className="absolute h-3 w-3 animate-spin text-white left-1/2 -translate-x-1/2" />
                  )}
                </button>
              </div>

              <div className="border-t" style={{ borderColor: "rgba(198,198,198,0.2)" }} />

              {/* Marketing */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Offres promotionnelles</p>
                  <p className="text-xs text-gray-500 mt-0.5">Recevoir les offres spéciales et nouveautés</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifyMarketing}
                  onClick={() => handleToggleNotification("notifyMarketing", !notifyMarketing)}
                  disabled={savingNotif === "notifyMarketing"}
                  className={`relative inline-flex h-6 w-11 items-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 ${
                    notifyMarketing ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifyMarketing ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                  {savingNotif === "notifyMarketing" && (
                    <Loader2 className="absolute h-3 w-3 animate-spin text-white left-1/2 -translate-x-1/2" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── Section 4 : Suppression de compte ─── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Suppression de compte</h2>
        </div>

        <Card className="border rounded-md border-red-200 bg-red-50/30">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700 mb-4">
              La suppression de votre compte est irréversible. Toutes vos données, rendez-vous et favoris seront
              définitivement supprimés.
            </p>
            <Button
              variant="outline"
              className="rounded-md border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer mon compte
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ─── Delete confirmation modal ──────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-md shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Supprimer votre compte ?</h2>
            </div>
            <p className="text-sm text-gray-600">
              Cette action est irréversible. Vos données personnelles, rendez-vous et favoris seront
              définitivement supprimés.
            </p>
            <div>
              <label htmlFor="delete-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                Tapez <span className="font-bold text-red-600 tracking-wider">SUPPRIMER</span> pour confirmer
              </label>
              <input
                id="delete-confirm"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full h-10 rounded-md border border-red-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                placeholder="SUPPRIMER"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                className="rounded-md"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                disabled={deleting}
              >
                Annuler
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700 rounded-md disabled:opacity-50"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "SUPPRIMER" || deleting}
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}