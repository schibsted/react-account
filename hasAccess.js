let promise = null;

async function hasSubscription(sp_id, config) {
  if (!promise) {
    const req = fetch(
      `https://access.schibsted.digital/v1/access?pids=${config.pids.join(
        ","
      )}&spid_instance=spid.no&source=${config.source}&sp_id=${sp_id}`
    );
    promise = req.then((res) => res.json()).catch(() => false);
  }
  return promise;
}

export async function hasAccess(sp_id, config) {
  try {
    const data = await hasSubscription(sp_id, config);
    if (
      data &&
      data.entitled &&
      data.allowedFeatures &&
      data.allowedFeatures.length > 0
    ) {
      return true;
    }
  } catch (err) {
    // silent catch
  }
  return false;
}
