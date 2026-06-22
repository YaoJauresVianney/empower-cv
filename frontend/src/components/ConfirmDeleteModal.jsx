export default function ConfirmDeleteModal({ title, onConfirm, onCancel, loading = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-white rounded-2xl shadow-purple-sm w-full max-w-sm mx-4 p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="material-symbols-outlined text-[22px] text-error mt-0.5">delete_forever</span>
          <div>
            <p className="text-[15px] font-semibold text-on-surface">Supprimer cette offre ?</p>
            <p className="text-[13px] text-text-muted mt-1">
              <span className="font-medium text-on-surface">«&nbsp;{title}&nbsp;»</span> sera supprimée
              définitivement, ainsi que toutes ses shortlists et candidatures associées.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-outline border border-outline-variant/80
              hover:bg-primary-fixed transition-colors duration-150
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold
              text-white bg-error hover:bg-error/90 transition-colors duration-150
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && (
              <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
            )}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
