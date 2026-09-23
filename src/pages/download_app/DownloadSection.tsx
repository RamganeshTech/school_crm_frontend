// components/DownloadSection.tsx

import { useGetLatestRelease } from "../../api_services/download_app_api/downloadAppApi"

export default function DownloadSection() {
    const { data: release, isLoading, isError } = useGetLatestRelease()

    return (
        <section className="w-full bg-mainBg px-4 py-12 sm:py-16 md:py-20">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8 md:p-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-soft sm:h-16 sm:w-16">
                            {/* <Monitor className="h-7 w-7 text-primary sm:h-8 sm:w-8" /> */}
                            <i className="fa-solid fa-display h-7 w-7 text-primary sm:h-8 sm:w-8"></i>
                        </div>

                        <h2 className="text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
                            DailyGrades Offline Desktop App
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-muted sm:text-base">
                            Manage your school fully offline — students, fees, attendance, and more, right from your desktop.
                        </p>

                        {isLoading && (
                            <div className="mt-8 h-11 w-48 animate-pulse rounded-lg bg-primary-soft" />
                        )}

                        {isError && (
                            <p className="mt-8 text-sm text-muted">
                                Unable to load the download link right now. Please try again shortly.
                            </p>
                        )}

                        {release && (
                            <>
                                <a
                                    href={release.windowsUrl}
                                    download
                                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-inverse transition-colors hover:bg-primary-hover sm:w-auto sm:text-base"
                                >
                                    {/* <Download className="h-4 w-4" /> */}
                                    <i className="fa-solid fa-download h-4 w-4"></i>

                                    Download for Windows
                                </a>

                                <div className="mt-4 flex flex-col items-center gap-1 text-xs text-muted sm:flex-row sm:gap-4">
                                    <span>Version {release.version}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>Released {new Date(release.releasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </>
                        )}

                        <div className="mt-8 flex w-full flex-col gap-2 border-t border-border-soft pt-6 sm:flex-row sm:justify-center sm:gap-6">
                            <div className="flex items-center justify-center gap-2 text-xs text-muted sm:text-sm">
                                {/* <CheckCircle2 className="h-4 w-4 text-success" /> */}
                                <i className="fa-solid fa-circle-check h-4 w-4 text-success"></i>
                                Works fully offline
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-muted sm:text-sm">
                                {/* <CheckCircle2 className="h-4 w-4 text-success" /> */}
                                <i className="fa-solid fa-circle-check h-4 w-4 text-success"></i>
                                Your data stays on your device
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}



// 45B6-CC54-11FE-2605 for password change 