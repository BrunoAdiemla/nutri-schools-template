import React, { useState, useEffect } from 'react'
import { MainLayout } from '../components/layout/MainLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { ImageUpload } from '../components/ui/ImageUpload'
import { LanguageSelector } from '../components/ui/LanguageSelector'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../hooks/useTranslation'
import { useTimer } from '../contexts/TimerContext'

export const ConfiguracoesPage: React.FC = () => {
  const { user, updateProfile, updatePassword } = useAuth()
  const { t } = useTranslation('configuracoes')
  const { isModalOpen: isTimerModalOpen } = useTimer()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  // Estados para dados do perfil
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  // Estados para alteração de senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '')
      setPhone(user.user_metadata?.phone || '')
      setAvatarUrl(user.user_metadata?.avatar_url || '')
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateProfile({
        full_name: fullName,
        phone: phone,
        avatar_url: avatarUrl
      })

      setSuccess(t('personalInfo.successMessage'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : t('personalInfo.updateError'))
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError(t('changePasswordModal.errors.passwordMismatch'))
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError(t('changePasswordModal.errors.passwordTooShort'))
      setPasswordLoading(false)
      return
    }

    try {
      await updatePassword(newPassword)

      setSuccess(t('changePasswordModal.successMessage'))
      setIsPasswordModalOpen(false)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : t('changePasswordModal.errors.changeError'))
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false)
    setNewPassword('')
    setConfirmPassword('')
    setError('')
  }

  const handleImageUploaded = (url: string) => {
    setAvatarUrl(url)
    setSuccess(t('personalInfo.imageUploadSuccess'))
    setTimeout(() => setSuccess(''), 5000)
  }

  const handleImageError = (errorMessage: string) => {
    setError(errorMessage)
    setTimeout(() => setError(''), 5000)
  }

  return (
    <MainLayout>
      <div className={`space-y-6 ${isTimerModalOpen ? 'relative -z-10' : ''}`}>
        {/* Header */}
        <div className={isTimerModalOpen ? 'relative -z-10' : ''}>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('subtitle')}
          </p>
        </div>

        {/* Mensagens de feedback */}
        {success && (
          <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${isTimerModalOpen ? 'relative -z-10' : ''}`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${isTimerModalOpen ? 'relative -z-10' : ''}`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isTimerModalOpen ? 'relative -z-10' : ''}`}>
          {/* Card de Informações Pessoais */}
          <Card className={isTimerModalOpen ? 'relative -z-10' : ''} padding="none">
            <div className={`p-6 ${isTimerModalOpen ? 'relative -z-10' : ''}`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('personalInfo.title')}</h2>
                  <p className="text-sm text-gray-600">{t('personalInfo.subtitle')}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className={`space-y-4 ${isTimerModalOpen ? 'relative -z-10' : ''}`}>
                <FormField label={t('personalInfo.fullName')} required>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('personalInfo.fullNamePlaceholder')}
                    required
                    className={isTimerModalOpen ? 'relative -z-10' : ''}
                  />
                </FormField>

                <FormField label={t('personalInfo.email')}>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={`bg-gray-100 cursor-not-allowed ${isTimerModalOpen ? 'relative -z-10' : ''}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('personalInfo.emailNote')}
                  </p>
                </FormField>

                <FormField label={t('personalInfo.phone')}>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('personalInfo.phonePlaceholder')}
                    className={isTimerModalOpen ? 'relative -z-10' : ''}
                  />
                </FormField>

                <LanguageSelector />

                <FormField label={t('personalInfo.profilePhoto')}>
                  <ImageUpload
                    currentImageUrl={avatarUrl}
                    onImageUploaded={handleImageUploaded}
                    onError={handleImageError}
                  />
                </FormField>

                <div className="pt-4">
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full"
                  >
                    {t('personalInfo.saveButton')}
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          {/* Card de Segurança */}
          <Card className={isTimerModalOpen ? 'relative -z-10' : ''} padding="none">
            <div className={`p-6 ${isTimerModalOpen ? 'relative -z-10' : ''}`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('security.title')}</h2>
                  <p className="text-sm text-gray-600">{t('security.subtitle')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{t('security.passwordTitle')}</h3>
                      <p className="text-sm text-gray-600">
                        {t('security.passwordLastChange')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
                      {t('security.changePasswordButton')}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-blue-900">{t('security.securityTip.title')}</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {t('security.securityTip.message')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Alteração de Senha */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        title={t('changePasswordModal.title')}
        size="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <FormField label={t('changePasswordModal.newPassword')} required>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('changePasswordModal.newPasswordPlaceholder')}
              required
              minLength={6}
            />
          </FormField>

          <FormField label={t('changePasswordModal.confirmPassword')} required>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('changePasswordModal.confirmPasswordPlaceholder')}
              required
              minLength={6}
            />
          </FormField>

          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-xs text-yellow-700">
                {t('changePasswordModal.passwordRequirement')}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClosePasswordModal}
              disabled={passwordLoading}
            >
              {t('changePasswordModal.cancelButton')}
            </Button>
            <Button
              type="submit"
              loading={passwordLoading}
              disabled={!newPassword || !confirmPassword}
            >
              {t('changePasswordModal.changeButton')}
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  )
}